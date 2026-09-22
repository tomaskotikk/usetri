import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, Crown, Info, Lock, Users } from 'lucide-react'
import { ServiceIcon } from '@/components/illustrations/ServiceIcon'
import { Avatar } from '@/components/dashboard/Sidebar'
import { SeatMeter } from '@/components/dashboard/OfferCard'
import {
  DeleteOfferButton,
  JoinButton,
  LeaveButton,
  RemoveMemberButton,
  ToggleClosedButton,
} from '@/components/dashboard/OfferActions'
import { getMembers, getOffer, requireUser } from '@/lib/dashboard'
import { formatCzk, formatSince } from '@/lib/format'

export const metadata: Metadata = { title: 'Nabídka — Ušetři' }

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await requireUser()

  const offer = await getOffer(supabase, user.id, id)
  if (!offer) notFound()

  const members = await getMembers(supabase, offer.id)
  const free = Math.max(0, offer.seatsTotal - offer.seatsTaken)
  const isOwner = offer.role === 'owner'

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/nabidky"
        className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-navy-deep"
      >
        <ArrowLeft className="h-4 w-4" /> Zpět na nabídky
      </Link>

      <section className="relative isolate overflow-hidden rounded-3xl p-6 text-white sm:p-8">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(120% 120% at 80% 0%, #16294f 0%, #0b1730 45%, #050b1a 100%)' }}
        />
        <div className="absolute inset-0 -z-10 grain" />
        <div
          className="absolute -right-12 -top-16 -z-10 h-64 w-64 rounded-full blur-[90px]"
          style={{ background: `color-mix(in srgb, ${offer.service.color} 45%, transparent)` }}
        />

        <div className="flex flex-wrap items-start gap-5">
          <ServiceIcon service={offer.service} size="lg" onDark />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em]">{offer.service.name}</h1>
              {offer.closed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold">
                  <Lock className="h-3 w-3" /> Nábor uzavřen
                </span>
              )}
            </div>
            <p className="mt-0.5 text-white/60">{offer.service.plan}</p>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <SeatMeter taken={offer.seatsTaken} total={offer.seatsTotal} />
                {offer.seatsTaken} z {offer.seatsTotal} míst
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> založeno {formatSince(offer.createdAt)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="font-mono text-4xl font-bold tracking-[-0.05em]">{formatCzk(offer.pricePerSeat)}</p>
            <p className="text-[12px] text-white/55">měsíčně za místo</p>
            <p className="mt-2 inline-block rounded-full bg-brand/20 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
              ušetříš {formatCzk(offer.service.fullPrice - offer.pricePerSeat)}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          {offer.role === null && free > 0 && !offer.closed && <JoinButton groupId={offer.id} />}
          {offer.role === 'member' && <LeaveButton groupId={offer.id} />}
          {isOwner && <ToggleClosedButton groupId={offer.id} closed={offer.closed} />}
          {isOwner && <DeleteOfferButton groupId={offer.id} />}
          {offer.role === null && (free === 0 || offer.closed) && (
            <span className="rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white/70">
              {free === 0 ? 'Všechna místa jsou obsazená.' : 'Zakladatel právě nepřijímá nové členy.'}
            </span>
          )}
        </div>
      </section>

      {offer.note && (
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-[12px] font-semibold uppercase tracking-widest text-fg-muted">
            Poznámka od zakladatele
          </h2>
          <p className="mt-2 whitespace-pre-line text-[15px] text-navy-deep">{offer.note}</p>
        </section>
      )}

      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-navy-deep">
          <Users className="h-4 w-4 text-brand" /> Členové skupiny
          <span className="font-sans text-sm font-medium text-fg-muted">
            {offer.seatsTaken} z {offer.seatsTotal}
          </span>
        </h2>

        <ul className="mt-4 divide-y divide-border">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3 py-3">
              <Avatar name={member.name} src={member.avatar} className="h-9 w-9" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium text-navy-deep">
                  {member.name}
                  {member.userId === user.id && <span className="text-[11px] text-fg-muted">(ty)</span>}
                  {member.role === 'owner' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-navy-deep px-2 py-0.5 text-[10px] font-semibold text-white">
                      <Crown className="h-3 w-3" /> zakladatel
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-fg-muted">přidal se {formatSince(member.joinedAt)}</p>
              </div>
              {isOwner && member.role === 'member' && (
                <RemoveMemberButton groupId={offer.id} userId={member.userId} name={member.name} />
              )}
            </li>
          ))}

          {Array.from({ length: free }).map((_, i) => (
            <li key={`free-${i}`} className="flex items-center gap-3 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-border text-fg-muted">
                +
              </span>
              <p className="text-sm text-fg-muted">Volné místo</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="flex items-start gap-2 rounded-2xl bg-muted px-4 py-3 text-[13px] text-fg-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Platby zatím nejsou napojené. Po přidání se domluvte se zakladatelem napřímo — v další verzi
        to za vás vyřeší Ušetři.
      </p>
    </div>
  )
}
