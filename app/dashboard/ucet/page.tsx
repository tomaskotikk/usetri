import type { Metadata } from 'next'
import { BadgeCheck, Database, Landmark, LogOut, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/dashboard/Sidebar'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { PayoutAccountForm } from '@/components/dashboard/PayoutAccountForm'
import { logout } from '@/app/auth/actions'
import { getMyOffers, requireUser, summarise } from '@/lib/dashboard'
import { getPayoutAccount } from '@/lib/payments'
import { formatCzk } from '@/lib/format'

export const metadata: Metadata = { title: 'Můj účet — Ušetři' }

export default async function AccountPage() {
  const { supabase, user } = await requireUser()

  const [{ data: profile }, offers, account] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url, created_at').eq('id', user.id).maybeSingle(),
    getMyOffers(supabase, user.id),
    getPayoutAccount(supabase, user.id),
  ])

  const stats = summarise(offers)
  const meta = user.user_metadata ?? {}
  const name =
    profile?.full_name || (meta.full_name as string) || (meta.name as string) || user.email || 'Můj účet'
  const avatar = profile?.avatar_url ?? ((meta.avatar_url as string) || (meta.picture as string)) ?? null

  const rows = [
    { icon: Mail, label: 'E-mail', value: user.email ?? '—' },
    { icon: ShieldCheck, label: 'Způsob přihlášení', value: user.app_metadata?.provider ?? 'email' },
    { icon: BadgeCheck, label: 'Profil v databázi', value: profile ? 'propojeno ✓' : 'chybí' },
    { icon: Database, label: 'ID uživatele', value: user.id, mono: true },
  ]

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Účet" title="Profil" subtitle="Údaje, se kterými tě vidí ostatní členové." />

      <section className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <Avatar name={name} src={avatar} className="h-16 w-16" />
          <div className="min-w-0">
            <p className="font-display text-2xl font-extrabold tracking-tight text-navy-deep">{name}</p>
            <p className="truncate text-sm text-fg-muted">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-border">
          {rows.map(({ icon: Icon, label, value, mono }) => (
            <div key={label} className="flex items-start gap-3 py-3.5">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <div className="min-w-0">
                <dt className="text-[11px] uppercase tracking-widest text-fg-muted">{label}</dt>
                <dd className={`mt-0.5 break-all text-sm text-navy-deep ${mono ? 'font-mono text-xs' : ''}`}>
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-navy-deep">
          <Landmark className="h-4 w-4 text-brand" /> Výplatní účet
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Sem ti členové tvých skupin posílají peníze. Vidí ho jen lidé, kteří jsou v některé z tvých skupin.
        </p>
        <div className="mt-4 max-w-md">
          <PayoutAccountForm current={account?.display} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Tile label="Skupiny" value={String(stats.groups)} />
        <Tile label="Měsíčně platíš" value={formatCzk(stats.monthly)} />
        <Tile label="Měsíčně šetříš" value={formatCzk(stats.saved)} accent />
      </section>

      <form action={logout}>
        <Button
          type="submit"
          variant="outline"
          className="h-11 w-full gap-2 rounded-xl bg-white sm:w-auto sm:px-6"
        >
          <LogOut className="h-4 w-4" /> Odhlásit se
        </Button>
      </form>
    </div>
  )
}

function Tile({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[12px] font-medium text-fg-muted">{label}</p>
      <p
        className={`mt-1.5 font-mono text-2xl font-bold tracking-[-0.03em] ${
          accent ? 'text-brand-foreground' : 'text-navy-deep'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
