'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, LayoutDashboard, LogOut, PlusCircle, UserRound, Users } from 'lucide-react'
import { GlobeCanvas } from '@/components/illustrations/GlobeCanvas'
import { logout } from '@/app/auth/actions'

const links = [
  { href: '/dashboard', label: 'Přehled', icon: LayoutDashboard },
  { href: '/dashboard/nabidky', label: 'Nabídky', icon: Compass },
  { href: '/dashboard/nova', label: 'Nabídnout', icon: PlusCircle },
  { href: '/dashboard/moje', label: 'Moje skupiny', icon: Users },
  { href: '/dashboard/ucet', label: 'Účet', icon: UserRound },
]

function useActive() {
  const pathname = usePathname()
  return (href: string) => (href === '/dashboard' ? pathname === href : pathname.startsWith(href))
}

export type DashboardUser = { name: string; email: string; avatar: string | null }

export function Sidebar({ user }: { user: DashboardUser }) {
  const isActive = useActive()

  return (
    <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col overflow-hidden bg-navy-deep text-white lg:flex">
      {/* same ambient treatment as the landing hero */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(130% 80% at 20% 0%, #10305c 0%, #071229 45%, #050b1a 100%)' }}
      />
      <div className="absolute -left-24 top-16 -z-10 h-[320px] w-[320px] rounded-full bg-brand/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 -z-10 h-[440px] w-[440px] opacity-40">
        <GlobeCanvas className="h-full w-full" />
      </div>

      <Link href="/" className="px-6 py-7 font-display text-xl font-extrabold tracking-tight">
        Ušetři<span className="text-brand">.</span>
      </Link>

      <nav className="flex flex-col gap-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {/* mint rail marks the current page */}
              <span
                className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand transition-all ${
                  active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                }`}
                aria-hidden="true"
              />
              <Icon
                className={`h-[18px] w-[18px] transition-colors ${active ? 'text-brand' : 'text-white/45 group-hover:text-white/80'}`}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto p-3">
        <Link
          href="/dashboard/ucet"
          className="block rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-xl transition-colors hover:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={user.avatar} className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-[11px] text-white/45">{user.email}</p>
            </div>
          </div>
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[13px] font-medium text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Odhlásit se
          </button>
        </form>
      </div>
    </aside>
  )
}

/** Phone header — the sidebar's branding and account link, condensed. */
export function MobileTopBar({ user }: { user: DashboardUser }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-deep/90 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight text-white">
          Ušetři<span className="text-brand">.</span>
        </Link>
        <Link href="/dashboard/ucet" aria-label="Můj účet">
          <Avatar name={user.name} src={user.avatar} className="h-8 w-8" />
        </Link>
      </div>
    </header>
  )
}

/** Bottom tab bar — the sidebar's stand-in below the lg breakpoint. */
export function MobileNav() {
  const isActive = useActive()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy-deep/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center gap-1 pb-2.5 pt-3 text-[10px] font-medium"
            >
              <span
                className={`absolute inset-x-4 top-0 h-0.5 rounded-full bg-brand transition-opacity ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
              />
              <Icon
                className={`h-5 w-5 transition-colors ${active ? 'text-brand' : 'text-white/45'}`}
              />
              <span className={active ? 'text-brand' : 'text-white/45'}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function Avatar({
  name,
  src,
  className = 'h-10 w-10',
}: {
  name: string
  src?: string | null
  className?: string
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className={`${className} shrink-0 rounded-full object-cover`}
      />
    )
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <span
      className={`${className} grid shrink-0 place-items-center rounded-full bg-brand text-[11px] font-bold text-brand-foreground`}
    >
      {initials || '?'}
    </span>
  )
}
