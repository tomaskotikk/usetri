import { MobileNav, MobileTopBar, Sidebar, type DashboardUser } from '@/components/dashboard/Sidebar'
import { requireUser } from '@/lib/dashboard'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser()

  const meta = user.user_metadata ?? {}
  const profile: DashboardUser = {
    name: (meta.full_name as string) || (meta.name as string) || user.email || 'Můj účet',
    email: user.email ?? '',
    avatar: ((meta.avatar_url as string) || (meta.picture as string)) ?? null,
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar user={profile} />

      <div className="relative min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-grid-light" />
          <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-brand/10 blur-[130px]" />
          <div className="absolute -left-24 top-[60%] h-[360px] w-[360px] rounded-full bg-cyan-accent/10 blur-[130px]" />
        </div>

        <MobileTopBar user={profile} />

        <main className="relative mx-auto w-full max-w-5xl px-4 pb-32 pt-8 sm:px-8 lg:pb-16 lg:pt-12">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
