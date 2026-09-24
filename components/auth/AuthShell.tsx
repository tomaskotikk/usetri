import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AuthShowcase } from './AuthShowcase'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="relative flex flex-col bg-surface px-6 py-8 sm:px-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-grid-light" />
          <div className="absolute -left-32 top-1/4 h-[380px] w-[380px] glow scale-150 [--glow:color-mix(in_srgb,var(--brand)_10%,transparent)]" />
        </div>
        <div className="relative flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-navy-deep">
            Ušetři<span className="text-brand">.</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-navy-deep">
            <ArrowLeft className="h-4 w-4" /> Zpět
          </Link>
        </div>
        <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
      </div>
      <AuthShowcase />
    </main>
  )
}
