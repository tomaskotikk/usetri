import Link from 'next/link'
import { ArrowUpRight, Crown, Lock } from 'lucide-react'
import { ServiceIcon } from '@/components/illustrations/ServiceIcon'
import { Avatar } from './Sidebar'
import { JoinButton, LeaveButton } from './OfferActions'
import { formatCzk, formatSince } from '@/lib/format'
import type { Offer } from '@/lib/dashboard'

/** Segmented bar: one slot per seat, filled ones in brand mint. */
export function SeatMeter({ taken, total }: { taken: number; total: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${taken} z ${total} míst obsazeno`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-5 rounded-full transition-colors ${i < taken ? 'bg-brand' : 'bg-border'}`}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

/** Overlapping faces of everyone already in the plan. */
function MemberStack({ members, free }: { members: Offer['members']; free: number }) {
  const shown = members.slice(0, 4)
  const hidden = members.length - shown.length

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((m) => (
          <span key={m.id} title={m.name} className="rounded-full ring-2 ring-card">
            <Avatar name={m.name} src={m.avatar} className="h-7 w-7" />
          </span>
        ))}
        {hidden > 0 && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-navy-deep text-[10px] font-bold text-white ring-2 ring-card">
            +{hidden}
          </span>
        )}
        {free > 0 &&
          Array.from({ length: Math.min(free, 3) }).map((_, i) => (
            <span
              key={`free-${i}`}
              className="grid h-7 w-7 place-items-center rounded-full border border-dashed border-fg-muted/35 bg-card text-[11px] text-fg-muted ring-2 ring-card"
            >
              +
            </span>
          ))}
      </div>
    </div>
  )
}

export function OfferCard({ offer }: { offer: Offer }) {
  const free = Math.max(0, offer.seatsTotal - offer.seatsTaken)
  const full = free === 0
  const saving = offer.service.fullPrice - offer.pricePerSeat
  const dimmed = offer.closed || full

  return (
    <article
      className={`group relative isolate overflow-hidden rounded-3xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_18px_40px_-20px_rgba(5,11,26,0.35)] sm:p-6 ${
        dimmed ? 'opacity-90' : ''
      }`}
    >
      {/* a breath of the service's own colour, so a wall of cards isn't uniform */}
      <div
        className="pointer-events-none absolute -right-16 -top-20 -z-10 h-48 w-48 rounded-full opacity-[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.13]"
        style={{ background: offer.service.color }}
      />

      <div className="flex items-start gap-4">
        <ServiceIcon service={offer.service} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/dashboard/nabidky/${offer.id}`}
              className="font-display text-lg font-bold tracking-[-0.02em] text-navy-deep decoration-brand decoration-2 underline-offset-4 hover:underline"
            >
              {offer.service.name}
            </Link>
            {offer.role === 'owner' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-navy-deep px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                <Crown className="h-3 w-3" /> tvoje
              </span>
            )}
            {offer.role === 'member' && (
              <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-foreground">
                jsi člen
              </span>
            )}
            {offer.closed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
                <Lock className="h-3 w-3" /> uzavřeno
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-fg-muted">{offer.service.plan}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-mono text-2xl font-bold leading-none tracking-[-0.04em] text-navy-deep">
            {formatCzk(offer.pricePerSeat)}
          </p>
          <p className="mt-1 text-[11px] text-fg-muted">/ měsíc za místo</p>
          <span className="mt-2 inline-block rounded-full bg-brand/12 px-2 py-0.5 text-[11px] font-semibold text-brand-foreground">
            ušetříš {formatCzk(saving)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <MemberStack members={offer.members} free={free} />
          <div className="mt-2.5 flex items-center gap-2.5">
            <SeatMeter taken={offer.seatsTaken} total={offer.seatsTotal} />
            <span className="text-[12px] font-medium text-fg-muted">
              {full ? 'obsazeno' : `${free} volná místa`}
            </span>
          </div>
          <p className="mt-2 truncate text-[12px] text-fg-muted">
            Zakládá {offer.owner.name} · {formatSince(offer.createdAt)}
          </p>
        </div>

        <div className="shrink-0">
          {offer.role === null && !full && !offer.closed && <JoinButton groupId={offer.id} />}
          {offer.role === 'member' && <LeaveButton groupId={offer.id} />}
          {offer.role === 'owner' && (
            <Link
              href={`/dashboard/nabidky/${offer.id}`}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-medium text-navy-deep transition-colors hover:border-navy-deep/25 hover:bg-muted"
            >
              Spravovat <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
          {offer.role === null && dimmed && (
            <span className="text-[13px] font-medium text-fg-muted">
              {full ? 'Obsazeno' : 'Nábor uzavřen'}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
