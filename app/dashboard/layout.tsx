import { MobileNav, MobileTopBar, Sidebar, type DashboardUser } from '@/components/dashboard/Sidebar'
import { avatarFromSession, requireUser, syncProfileAvatar } from '@/lib/dashboard'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser()

  const meta = user.user_metadata ?? {}
  // So the rest of the app can show this face too, not just the viewer's own corner.
  await syncProfileAvatar(supabase, user.id, meta)

  const profile: DashboardUser = {
    name: (meta.full_name as string) || (meta.name as string) || user.email || 'Můj účet',
    email: user.email ?? '',
    avatar: avatarFromSession(meta),
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar user={profile} />

      <div className="relative min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-grid-light" />
          <div className="absolute -right-32 top-0 h-[420px] w-[420px] glow scale-150 [--glow:color-mix(in_srgb,var(--brand)_10%,transparent)]" />
          <div className="absolute -left-24 top-[60%] h-[360px] w-[360px] glow scale-150 [--glow:color-mix(in_srgb,var(--cyan-accent)_10%,transparent)]" />
        </div>

        <MobileTopBar user={profile} />

        <main className="relative mx-auto w-full max-w-5xl px-5 pb-32 pt-6 sm:px-8 lg:pb-16 lg:pt-12">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
