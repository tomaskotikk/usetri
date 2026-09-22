import Link from 'next/link'
import { TrendingDown } from 'lucide-react'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { Mascot } from '@/components/illustrations/Mascot'
import { Avatar, type DashboardUser } from './Sidebar'
import { formatCzk } from '@/lib/format'

/**
 * The overview's header on phones, matching the Expo app's home screen: one navy
 * gradient block with rounded bottom corners holding the wordmark, the greeting,
 * Ušetřík and the savings card. Hidden from lg up, where the sidebar and the wide
 * savings panel take over.
 *
 * Sizes here are the app's own (src/screens/HomeScreen.tsx) rather than the
 * website's scale, so the two read as the same screen.
 */
export function AppHeader({
  user,
  firstName,
  stats,
}: {
  user: DashboardUser
  firstName: string
  stats: { saved: number; monthly: number; groups: number; savedPercent: number }
}) {
  return (
    <header
      className="rounded-b-[28px] px-5 pb-[22px] pt-[calc(env(safe-area-inset-top)+18px)] text-white lg:hidden"
      style={{ background: 'linear-gradient(180deg, #10305c 0%, #0b1730 55%, #050b1a 100%)' }}
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="font-display text-[19px] font-extrabold tracking-[-0.5px]">
          Ušetři<span className="text-brand">.</span>
        </Link>
        <Link href="/dashboard/ucet" aria-label="Můj účet">
          <Avatar name={user.name} src={user.avatar} className="h-8 w-8" />
        </Link>
      </div>

      <div className="mt-2.5 flex items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="font-display text-[28px] font-extrabold leading-tight tracking-[-1px]">
            {firstName ? `Ahoj, ${firstName}.` : 'Ahoj.'}
          </p>
          <p className="mt-1 text-[13.5px] text-white/55">
            {stats.groups > 0
              ? `Jsi v ${stats.groups === 1 ? '1 skupině' : `${stats.groups} skupinách`}.`
              : 'Pojď si najít první skupinu.'}
          </p>
        </div>
        <Mascot size={88} mood="wave" holds={stats.saved > 0 ? 'bag' : undefined} />
      </div>

      <div className="mt-4 rounded-3xl border border-white/[0.12] bg-white/[0.06] p-[18px]">
        <p className="text-[11px] uppercase tracking-[1.4px] text-white/55">Tento měsíc šetříš</p>
        <p className="mt-1 font-mono text-[38px] font-extrabold leading-none tracking-[-1.8px]">
          <AnimatedNumber value={stats.saved} suffix=" Kč" />
        </p>

        {stats.savedPercent > 0 && (
          <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-brand/[0.18] px-2.5 py-1 text-[11.5px] font-bold text-brand">
            <TrendingDown className="h-3 w-3" />o {stats.savedPercent} % méně než samostatně
          </span>
        )}

        <div className="mt-4 flex gap-3.5 border-t border-white/10 pt-3.5">
          <Stat label="Platíš měsíčně" value={formatCzk(stats.monthly)} />
          <Stat label="Skupiny" value={String(stats.groups)} />
          <Stat label="Ročně ušetříš" value={formatCzk(stats.saved * 12)} />
        </div>
      </div>
    </header>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1">
      <p className="text-[10px] uppercase tracking-[0.8px] text-white/50">{label}</p>
      <p className="mt-[3px] font-mono text-base font-bold">{value}</p>
    </div>
  )
}
