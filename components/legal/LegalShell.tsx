import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { LEGAL_PAGES, LEGAL_UPDATED } from '@/lib/legal'

/**
 * The frame the legal pages share. No typography plugin in this project, so the
 * prose styles live here as small components rather than as a `prose` class.
 */
export function LegalShell({
  title,
  intro,
  children,
}: {
  title: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="bg-surface pb-24 pt-32">
        <div className="mx-auto max-w-3xl px-6">
          <nav className="flex flex-wrap gap-2">
            {LEGAL_PAGES.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="rounded-lg bg-navy-deep/5 px-3 py-1.5 text-[13px] font-medium text-navy-deep transition-colors hover:bg-navy-deep/10"
              >
                {page.label}
              </Link>
            ))}
          </nav>

          <h1 className="mt-8 font-display text-[44px] font-extrabold leading-[1.08] tracking-[-0.035em] text-navy-deep">
            {title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-fg-muted">{intro}</p>
          <p className="mt-6 text-[13px] text-fg-muted/80">Účinné od {LEGAL_UPDATED}</p>

          <div className="mt-12">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-8 mt-8 first:mt-0 first:border-t-0 first:pt-0">
      <h2 className="font-display text-[24px] font-extrabold tracking-[-0.02em] text-navy-deep">
        <span className="mr-3 text-brand">{n}.</span>
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[16px] leading-[1.7] text-navy-deep/85">{children}</p>
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2.5">{children}</ul>
}

export function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[16px] leading-[1.7] text-navy-deep/85">
      <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
      <span>{children}</span>
    </li>
  )
}

/** For the things a reader must not miss. */
export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand/30 bg-brand/8 px-5 py-4">
      <p className="text-[15.5px] leading-[1.65] text-navy-deep">{children}</p>
    </div>
  )
}
