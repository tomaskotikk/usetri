import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PlusCircle, SlidersHorizontal } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { PageHeader, SectionHeading } from '@/components/dashboard/PageHeader'
import { Reveal } from '@/components/dashboard/Reveal'
import { OfferCard } from '@/components/dashboard/OfferCard'
import { OfferFilters } from '@/components/dashboard/OfferFilters'
import { getOffers, requireUser } from '@/lib/dashboard'

export const metadata: Metadata = { title: 'Nabídky — Ušetři' }

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategorie?: string }>
}) {
  const { q, kategorie } = await searchParams
  const { supabase, user } = await requireUser()
  const offers = await getOffers(supabase, user.id, { search: q, category: kategorie })

  const open = offers.filter((o) => !o.closed && o.seatsTaken < o.seatsTotal)
  const rest = offers.filter((o) => o.closed || o.seatsTaken >= o.seatsTotal)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tržiště"
        title="Nabídky"
        subtitle="Volná místa v rodinných plánech, která nabízí ostatní členové."
        action={{ href: '/dashboard/nova', label: 'Nabídnout místo' }}
      />

      <Suspense fallback={<div className="h-12 rounded-xl border border-border bg-white" />}>
        <OfferFilters />
      </Suspense>

      {offers.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title={q || kategorie ? 'Nic tu na tebe nečeká' : 'Zatím tu nejsou žádné nabídky'}
          text={
            q || kategorie
              ? 'Zkus jiný filtr nebo hledaný výraz.'
              : 'Buď první, kdo nabídne volné místo ve svém rodinném plánu.'
          }
          primary={{ href: '/dashboard/nova', label: 'Nabídnout místo', icon: PlusCircle }}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-3">
            {open.map((offer, i) => (
              <Reveal key={offer.id} delay={Math.min(i, 6) * 0.05}>
                <OfferCard offer={offer} />
              </Reveal>
            ))}
          </div>

          {rest.length > 0 && (
            <section>
              <SectionHeading title="Obsazené a uzavřené" count={rest.length} />
              <div className="grid gap-3 opacity-75">
                {rest.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
