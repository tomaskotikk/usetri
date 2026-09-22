import type { Metadata } from 'next'
import { Compass, PlusCircle, Ticket } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { PageHeader, SectionHeading } from '@/components/dashboard/PageHeader'
import { Reveal } from '@/components/dashboard/Reveal'
import { OfferCard } from '@/components/dashboard/OfferCard'
import { getMyOffers, requireUser, summarise } from '@/lib/dashboard'
import { formatCzk } from '@/lib/format'

export const metadata: Metadata = { title: 'Moje skupiny — Ušetři' }

export default async function MyGroupsPage() {
  const { supabase, user } = await requireUser()
  const offers = await getMyOffers(supabase, user.id)
  const stats = summarise(offers)

  const owned = offers.filter((o) => o.role === 'owner')
  const joined = offers.filter((o) => o.role === 'member')

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Moje"
        title="Skupiny"
        subtitle={
          offers.length === 0
            ? 'Tady uvidíš všechno, co nabízíš i kam ses přidal.'
            : `Měsíčně platíš ${formatCzk(stats.monthly)} a ušetříš ${formatCzk(stats.saved)}.`
        }
        action={{ href: '/dashboard/nova', label: 'Nabídnout místo' }}
      />

      {offers.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Zatím prázdno"
          text="Přidej se do cizí skupiny, nebo nabídni volná místa ve svém předplatném."
          primary={{ href: '/dashboard/nabidky', label: 'Procházet nabídky', icon: Compass }}
          secondary={{ href: '/dashboard/nova', label: 'Nabídnout místo' }}
        />
      ) : (
        <>
          <section>
            <SectionHeading title="Nabízím" count={owned.length} />
            {owned.length === 0 ? (
              <EmptyState
                icon={PlusCircle}
                title="Zatím nic nenabízíš"
                text="Máš doma rodinný plán s volným místem? Nabídni ho ostatním."
                primary={{ href: '/dashboard/nova', label: 'Nabídnout místo', icon: PlusCircle }}
              />
            ) : (
              <div className="grid gap-3">
                {owned.map((offer, i) => (
                  <Reveal key={offer.id} delay={i * 0.06}>
                    <OfferCard offer={offer} />
                  </Reveal>
                ))}
              </div>
            )}
          </section>

          {joined.length > 0 && (
            <section>
              <SectionHeading title="Přidal jsem se" count={joined.length} />
              <div className="grid gap-3">
                {joined.map((offer, i) => (
                  <Reveal key={offer.id} delay={i * 0.06}>
                    <OfferCard offer={offer} />
                  </Reveal>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
