import type { Metadata } from 'next'
import { NewOfferForm } from '@/components/dashboard/NewOfferForm'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { getCatalogue, requireUser } from '@/lib/dashboard'
import { getPayoutAccount } from '@/lib/payments'

export const metadata: Metadata = { title: 'Nová nabídka — Ušetři' }

export default async function NewOfferPage() {
  const { supabase, user } = await requireUser()
  const [services, account] = await Promise.all([getCatalogue(supabase), getPayoutAccount(supabase, user.id)])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nová nabídka"
        title="Nabídni místo"
        subtitle="Vyber službu, kterou už platíš, a nabídni volná místa ostatním. Zbytek dopočítáme."
      />

      <NewOfferForm services={services} payoutAccount={account?.display} />
    </div>
  )
}
