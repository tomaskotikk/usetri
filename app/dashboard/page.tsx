import type { Metadata } from 'next'
import { Compass, PiggyBank, PlusCircle, Sparkles, Users, Wallet } from 'lucide-react'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { AppHeader } from '@/components/dashboard/AppHeader'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Mascot } from '@/components/illustrations/Mascot'
import { OfferCard } from '@/components/dashboard/OfferCard'
import { PageHeader, SectionHeading } from '@/components/dashboard/PageHeader'
import { PaymentInbox } from '@/components/dashboard/PaymentInbox'
import { Reveal } from '@/components/dashboard/Reveal'
import { avatarFromSession, getMyOffers, getOffers, requireUser, summarise } from '@/lib/dashboard'
import { getPaymentInbox } from '@/lib/payments'
import { formatCzk } from '@/lib/format'

export const metadata: Metadata = { title: 'Přehled — Ušetři' }

export default async function DashboardPage() {
  const { supabase, user } = await requireUser()
  const [mine, fresh, inbox] = await Promise.all([
    getMyOffers(supabase, user.id),
    getOffers(supabase, user.id, { onlyOpen: true, limit: 12 }),
    getPaymentInbox(supabase, user.id),
  ])

  const stats = summarise(mine)
  const firstName = ((user.user_metadata?.full_name as string) ?? '').split(' ')[0]
  const recommended = fresh.filter((o) => o.role === null && o.seatsTaken < o.seatsTotal).slice(0, 4)
  const alone = stats.monthly + stats.saved

  const meta = user.user_metadata ?? {}

  return (
    <div className="space-y-10">
      {/* Breaks out of the main padding so the app header runs edge to edge. */}
      <div className="-mx-5 -mt-6 sm:-mx-8 lg:hidden">
        <AppHeader
          user={{
            name: (meta.full_name as string) || (meta.name as string) || user.email || 'Můj účet',
            email: user.email ?? '',
            avatar: avatarFromSession(meta),
          }}
          firstName={firstName}
          stats={stats}
        />
      </div>

      <PageHeader
        className="hidden lg:flex"
        eyebrow="Přehled"
        title={firstName ? `Ahoj, ${firstName}.` : 'Ahoj.'}
        subtitle={
          stats.groups > 0
            ? `Jsi ve ${stats.groups === 1 ? '1 skupině' : `${stats.groups} skupinách`} a platíš jen svůj podíl.`
            : 'Přidej se do skupiny, nebo nabídni místo ve svém předplatném.'
        }
        action={{ href: '/dashboard/nova', label: 'Nabídnout místo' }}
      />

      <PaymentInbox toPay={inbox.toPay} toConfirm={inbox.toConfirm} />

      <Reveal className="hidden lg:block">
        <section className="relative isolate overflow-hidden rounded-3xl p-6 text-white sm:p-8">
          <div
            className="absolute inset-0 -z-10"
            style={{ background: 'radial-gradient(120% 130% at 88% 0%, #16294f 0%, #0b1730 45%, #050b1a 100%)' }}
          />
          <div className="absolute -right-10 -top-24 -z-10 h-72 w-72 rounded-full bg-brand/25 blur-[110px]" />
          <div className="absolute inset-0 -z-10 grain" />

          <div className="flex flex-wrap items-center justify-between gap-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                Tento měsíc šetříš
              </p>
              <p className="mt-2 font-mono text-[clamp(2.6rem,7vw,3.6rem)] font-bold leading-none tracking-[-0.05em]">
                <AnimatedNumber value={stats.saved} suffix=" Kč" />
              </p>
              <p className="mt-3 text-sm text-white/55">
                Za rok to dělá{' '}
                <span className="font-semibold text-brand">{formatCzk(stats.saved * 12)}</span>
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Ušetřík cheers over the savings figure — the same character the app shows. */}
              <Mascot
                size={124}
                mood={stats.saved > 0 ? 'cheer' : 'idle'}
                holds="bag"
                className="hidden shrink-0 xl:block"
              />
              <SavingsRing percent={stats.savedPercent} />
              <dl className="space-y-4">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-white/45">Platíš</dt>
                  <dd className="mt-0.5 font-mono text-xl font-semibold">{formatCzk(stats.monthly)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-white/45">Sám bys platil</dt>
                  <dd className="mt-0.5 font-mono text-xl font-semibold text-white/45 line-through">
                    {formatCzk(alone)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </Reveal>

      <section className="hidden gap-3 sm:grid-cols-3 lg:grid">
        {[
          { icon: Wallet, label: 'Měsíční platba', value: formatCzk(stats.monthly), note: `${stats.groups} skupin` },
          { icon: PiggyBank, label: 'Roční úspora', value: formatCzk(stats.saved * 12), note: 'oproti samostatným', accent: true },
          {
            icon: Users,
            label: 'Volná místa u tebe',
            value: stats.owned === 0 ? '—' : String(stats.freeSeats),
            note: stats.owned === 0 ? 'zatím nic nenabízíš' : `v ${stats.owned} nabídkách`,
          },
        ].map((tile, i) => (
          <Reveal key={tile.label} delay={i * 0.06}>
            <StatTile {...tile} />
          </Reveal>
        ))}
      </section>

      <section>
        <SectionHeading
          title="Tvoje skupiny"
          count={mine.length || undefined}
          action={mine.length > 0 ? { href: '/dashboard/moje', label: 'Všechny' } : undefined}
        />
        {mine.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Zatím nejsi v žádné skupině"
            text="Najdi nabídku od ostatních, nebo nabídni volná místa ve svém předplatném."
            primary={{ href: '/dashboard/nabidky', label: 'Procházet nabídky', icon: Compass }}
            secondary={{ href: '/dashboard/nova', label: 'Nabídnout místo' }}
          />
        ) : (
          <div className="grid gap-3">
            {mine.slice(0, 3).map((offer, i) => (
              <Reveal key={offer.id} delay={i * 0.06}>
                <OfferCard offer={offer} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading title="Čerstvé nabídky" action={{ href: '/dashboard/nabidky', label: 'Všechny' }} />
        {recommended.length === 0 ? (
          <EmptyState
            icon={PlusCircle}
            title="Zatím tu nic nového není"
            text="Buď první, kdo nabídne volné místo ve svém rodinném plánu."
            primary={{ href: '/dashboard/nova', label: 'Nabídnout místo', icon: PlusCircle }}
          />
        ) : (
          <div className="grid gap-3">
            {recommended.map((offer, i) => (
              <Reveal key={offer.id} delay={i * 0.06}>
                <OfferCard offer={offer} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

/** Share of the full price the viewer no longer pays. */
function SavingsRing({ percent }: { percent: number }) {
  const r = 34
  const circumference = 2 * Math.PI * r
  const filled = (Math.min(100, Math.max(0, percent)) / 100) * circumference

  return (
    <div className="relative h-[92px] w-[92px] shrink-0">
      <svg viewBox="0 0 92 92" className="h-full w-full -rotate-90">
        <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
        <circle
          cx="46"
          cy="46"
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-mono text-lg font-bold tracking-[-0.03em]">{percent}%</span>
      </div>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  note,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  note?: string
  accent?: boolean
}) {
  return (
    <div className="h-full rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand/35">
      <div className="flex items-center gap-2.5">
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg ${
            accent ? 'bg-brand/15 text-brand-foreground' : 'bg-muted text-fg-muted'
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[12px] font-medium text-fg-muted">{label}</span>
      </div>
      <p className="mt-3 font-mono text-[26px] font-bold leading-none tracking-[-0.04em] text-navy-deep">
        {value}
      </p>
      {note && <p className="mt-1.5 text-[11px] text-fg-muted">{note}</p>}
    </div>
  )
}
