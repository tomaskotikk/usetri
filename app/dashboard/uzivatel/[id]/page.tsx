import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Crown, Users } from 'lucide-react'
import { Avatar } from '@/components/dashboard/Sidebar'
import { OfferCard } from '@/components/dashboard/OfferCard'
import { SectionHeading } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { getProfile, requireUser } from '@/lib/dashboard'
import { formatSince } from '@/lib/format'

export const metadata: Metadata = { title: 'Profil člena — Ušetři' }

function Stat({ icon: Icon, value, label }: { icon: typeof Crown; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-xl">
      <Icon className="h-4 w-4 shrink-0 text-brand" />
      <div className="min-w-0">
        <p className="font-mono text-lg font-bold leading-none">{value}</p>
        <p className="mt-1 text-[11px] text-white/50">{label}</p>
      </div>
    </div>
  )
}

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await requireUser()

  const profile = await getProfile(supabase, user.id, id)
  if (!profile) notFound()

  // Looking at your own row should land on the page where you can change things.
  if (profile.id === user.id) {
    return (
      <div className="space-y-6">
        <BackLink />
        <EmptyState
          icon={Users}
          title="Tohle jsi ty"
          text="Svoje údaje si upravíš na stránce účtu."
          primary={{ href: '/dashboard/ucet', label: 'Otevřít účet' }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <BackLink />

      <section className="relative isolate overflow-hidden rounded-3xl p-6 text-white sm:p-8">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(120% 120% at 80% 0%, #16294f 0%, #0b1730 45%, #050b1a 100%)' }}
        />
        <div className="absolute inset-0 -z-10 grain" />
        <div className="absolute -right-12 -top-16 -z-10 h-64 w-64 rounded-full bg-brand/25 blur-[90px]" />

        <div className="flex items-center gap-4">
          <Avatar name={profile.name} src={profile.avatar} className="h-16 w-16 ring-2 ring-white/15" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-[28px] font-extrabold tracking-[-0.03em] sm:text-[34px]">
              {profile.name}
            </h1>
            <p className="mt-1 text-sm text-white/55">Připojil se {formatSince(profile.joinedAt)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat icon={Crown} value={profile.owned} label="spravuje skupin" />
          <Stat icon={Users} value={profile.joined} label="je členem v" />
          <Stat icon={Users} value={profile.freeSeats} label="volných míst" />
        </div>
      </section>

      <section>
        <SectionHeading title="Otevřené nabídky" count={profile.offers.length} />
        {profile.offers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="Žádné otevřené nabídky"
            text={`${profile.name} teď nenabízí volná místa. Zkus to později.`}
          />
        )}
      </section>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      href="/dashboard/nabidky"
      className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-navy-deep"
    >
      <ArrowLeft className="h-4 w-4" /> Zpět na nabídky
    </Link>
  )
}
