import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className = '',
}: {
  eyebrow: string
  title: React.ReactNode
  subtitle?: string
  action?: { href: string; label: string }
  className?: string
}) {
  return (
    <header className={`flex-wrap items-end justify-between gap-4 ${className || 'flex'}`}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-foreground/70">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.9rem,4.5vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-navy-deep">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-xl text-[15px] text-fg-muted">{subtitle}</p>}
      </div>

      {action && (
        <Link
          href={action.href}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-navy-deep px-5 text-sm font-semibold text-white transition-colors hover:bg-navy"
        >
          {action.label} <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
    </header>
  )
}

/** Section heading with a mint rule, used down the dashboard pages. */
export function SectionHeading({
  title,
  count,
  action,
}: {
  title: string
  count?: number
  action?: { href: string; label: string }
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="h-4 w-1 rounded-full bg-brand" aria-hidden="true" />
      <h2 className="font-display text-lg font-bold tracking-tight text-navy-deep">{title}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-fg-muted">
          {count}
        </span>
      )}
      {action && (
        <Link
          href={action.href}
          className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-fg-muted transition-colors hover:text-navy-deep"
        >
          {action.label} <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
