import type { Metadata } from 'next'
import { NewOfferForm } from '@/components/dashboard/NewOfferForm'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { getCatalogue, requireUser } from '@/lib/dashboard'

export const metadata: Metadata = { title: 'Nová nabídka — Ušetři' }

export default async function NewOfferPage() {
  const { supabase } = await requireUser()
  const services = await getCatalogue(supabase)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nová nabídka"
        title="Nabídni místo"
        subtitle="Vyber službu, kterou už platíš, a nabídni volná místa ostatním. Zbytek dopočítáme."
      />

      <NewOfferForm services={services} />
    </div>
  )
}
