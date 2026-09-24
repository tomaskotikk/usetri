// lib/payments.ts
import { toService, type Offer, type requireUser } from './dashboard'
import { currentPeriod, periodStatus, todayInPrague, upcomingPeriod, type IsoDate, type PeriodStatus } from './billing'
import type { ServiceRow } from '@/types/database'
import type { Service } from '@/types/service'

type Supabase = Awaited<ReturnType<typeof requireUser>>['supabase']

export interface PayoutAccount {
  iban: string
  /** As Czech banks print it: 19-2000145399/0800. */
  display: string
}

export interface PeriodView {
  period: IsoDate
  status: PeriodStatus
  paymentId: string | null
  /** What was recorded, or today's price when nothing is recorded yet. */
  amount: number
}

type Paid = { id: string; user_id: string; period_start: string; amount: number; status: 'reported' | 'confirmed' }

function viewOf(period: IsoDate, payments: Paid[], userId: string, price: number, today: IsoDate): PeriodView {
  const payment = payments.find((p) => p.user_id === userId && p.period_start === period) ?? null
  return {
    period,
    status: periodStatus(period, payment?.status ?? null, today),
    paymentId: payment?.id ?? null,
    amount: payment?.amount ?? price,
  }
}

export async function getPayoutAccount(supabase: Supabase, userId: string): Promise<PayoutAccount | null> {
  const { data } = await supabase
    .from('payout_accounts')
    .select('iban, account_display')
    .eq('user_id', userId)
    .maybeSingle()
  return data ? { iban: data.iban, display: data.account_display } : null
}

export interface PaymentView {
  /** The owner's account. RLS hides it from anyone outside the group. */
  account: PayoutAccount | null
  /** The viewer's own periods, when they are a paying member. */
  mine: { vs: number; periods: PeriodView[] } | null
  /** Owner only: member user id → their current period. */
  members: Map<string, PeriodView>
}

export async function getPaymentView(supabase: Supabase, viewerId: string, offer: Offer): Promise<PaymentView> {
  if (offer.role === null) return { account: null, mine: null, members: new Map() }

  const today = todayInPrague()
  const [account, { data: billing }, { data: payments }] = await Promise.all([
    getPayoutAccount(supabase, offer.owner.id),
    supabase
      .from('group_members')
      .select('user_id, billing_start, payment_ref')
      .eq('group_id', offer.id)
      .eq('role', 'member'),
    supabase
      .from('payments')
      .select('id, user_id, period_start, amount, status')
      .eq('group_id', offer.id)
      .returns<Paid[]>(),
  ])
  const paid = payments ?? []

  if (offer.role === 'member') {
    const me = billing?.find((b) => b.user_id === viewerId)
    if (!me) return { account, mine: null, members: new Map() }

    const periods = [currentPeriod(me.billing_start, today), upcomingPeriod(me.billing_start, today)]
      .filter((p): p is IsoDate => p !== null)
      .map((p) => viewOf(p, paid, viewerId, offer.pricePerSeat, today))
    return { account, mine: { vs: me.payment_ref, periods }, members: new Map() }
  }

  const members = new Map(
    (billing ?? []).map((b) => [
      b.user_id,
      viewOf(currentPeriod(b.billing_start, today), paid, b.user_id, offer.pricePerSeat, today),
    ]),
  )
  return { account, mine: null, members }
}

export interface InboxItem extends PeriodView {
  groupId: string
  service: Service
  /** Set on items waiting for the owner's confirmation. */
  payerName?: string
}

/** What the overview asks the viewer to act on: pay, or confirm. */
export async function getPaymentInbox(supabase: Supabase, userId: string) {
  const today = todayInPrague()

  const [{ data: memberships }, { data: mine }, { data: reported }] = await Promise.all([
    supabase
      .from('group_members')
      .select('group_id, billing_start, groups(price_per_seat, services(*))')
      .eq('user_id', userId)
      .eq('role', 'member')
      .returns<
        {
          group_id: string
          billing_start: string
          groups: { price_per_seat: number; services: ServiceRow | null } | null
        }[]
      >(),
    supabase
      .from('payments')
      .select('id, group_id, user_id, period_start, amount, status')
      .eq('user_id', userId)
      .returns<(Paid & { group_id: string })[]>(),
    supabase
      .from('payments')
      .select('id, group_id, user_id, period_start, amount, profiles(full_name), groups!inner(owner_id, services(*))')
      .eq('status', 'reported')
      .eq('groups.owner_id', userId)
      .order('reported_at')
      .returns<
        {
          id: string
          group_id: string
          user_id: string
          period_start: string
          amount: number
          profiles: { full_name: string | null } | null
          groups: { owner_id: string; services: ServiceRow | null } | null
        }[]
      >(),
  ])

  const toPay: InboxItem[] = (memberships ?? []).flatMap((m) => {
    if (!m.groups?.services) return []
    const own = (mine ?? []).filter((p) => p.group_id === m.group_id)
    const view = viewOf(currentPeriod(m.billing_start, today), own, userId, m.groups.price_per_seat, today)
    if (view.status !== 'due' && view.status !== 'overdue') return []
    return [{ ...view, groupId: m.group_id, service: toService(m.groups.services) }]
  })

  const reportedList = reported ?? []
  const reportedGroupIds = [...new Set(reportedList.map((r) => r.group_id))]
  const { data: currentMembers } = reportedGroupIds.length
    ? await supabase.from('group_members').select('group_id, user_id').in('group_id', reportedGroupIds)
    : { data: [] as { group_id: string; user_id: string }[] }
  const stillMember = new Set((currentMembers ?? []).map((m) => `${m.group_id}:${m.user_id}`))

  const toConfirm: InboxItem[] = reportedList.flatMap((r) =>
    r.groups?.services && stillMember.has(`${r.group_id}:${r.user_id}`)
      ? [
          {
            period: r.period_start,
            status: 'reported' as const,
            paymentId: r.id,
            amount: r.amount,
            groupId: r.group_id,
            service: toService(r.groups.services),
            payerName: r.profiles?.full_name?.trim() || 'Anonymní člen',
          },
        ]
      : [],
  )

  return { toPay, toConfirm }
}
