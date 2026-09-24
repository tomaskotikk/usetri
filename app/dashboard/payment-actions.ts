// app/dashboard/payment-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/dashboard'
import { formatAccount, parseCzechAccount, toIban } from '@/lib/czech-account'
import type { ActionState } from './actions'

const ACCOUNT_ERROR = 'Tohle číslo účtu nevypadá správně. Zkontroluj ho prosím.'

function refresh() {
  revalidatePath('/dashboard', 'layout')
}

/** Shared with createOffer: validates and upserts the viewer's payout account. */
export async function savePayoutAccount(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser()
  const parsed = parseCzechAccount(String(formData.get('account') ?? ''))
  if (!parsed) return { error: ACCOUNT_ERROR }

  const { error } = await supabase.from('payout_accounts').upsert({
    user_id: user.id,
    iban: toIban(parsed),
    account_display: formatAccount(parsed),
    updated_at: new Date().toISOString(),
  })
  if (error) return { error: 'Účet se nepodařilo uložit. Zkus to prosím znovu.' }

  refresh()
  return { ok: true }
}

export async function reportPayment(groupId: string, period: string): Promise<ActionState> {
  const { supabase, user } = await requireUser()
  const { error } = await supabase
    .from('payments')
    .insert({ group_id: groupId, user_id: user.id, period_start: period, status: 'reported' })

  if (error) {
    if (error.code === '23505') return { error: 'Tuhle platbu už jsi nahlásil.' }
    return { error: 'Platbu se nepodařilo nahlásit. Zkus to prosím znovu.' }
  }
  refresh()
  return null
}

export async function undoReport(paymentId: string): Promise<ActionState> {
  const { supabase, user } = await requireUser()
  const { data, error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('user_id', user.id)
    .eq('status', 'reported')
    .select('id')

  if (error || !data?.length) return { error: 'Nahlášení se nepodařilo vzít zpět.' }
  refresh()
  return null
}

export async function confirmPayment(paymentId: string): Promise<ActionState> {
  const { supabase } = await requireUser()
  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'confirmed' })
    .eq('id', paymentId)
    .select('id')

  // RLS filters out payments in groups the viewer does not own: zero rows, no error.
  if (error || !data?.length) return { error: 'Platbu se nepodařilo potvrdit.' }
  refresh()
  return null
}

export async function rejectPayment(paymentId: string): Promise<ActionState> {
  const { supabase } = await requireUser()
  const { data, error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('status', 'reported')
    .select('id')

  if (error || !data?.length) return { error: 'Změna se nepovedla. Zkus to prosím znovu.' }
  refresh()
  return null
}

/** Owner records a payment that arrived another way, e.g. in cash. */
export async function markPaid(groupId: string, userId: string, period: string): Promise<ActionState> {
  const { supabase } = await requireUser()
  const { error } = await supabase
    .from('payments')
    .insert({ group_id: groupId, user_id: userId, period_start: period, status: 'confirmed' })

  if (error) {
    if (error.code === '23505') return { error: 'Tahle platba už je zapsaná.' }
    return { error: 'Platbu se nepodařilo zapsat.' }
  }
  refresh()
  return null
}
