import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

/**
 * On a phone this is the Expo app's screen header: a 30px title, a 13.5px
 * subtitle, nothing above it. The eyebrow and the action button appear only from
 * lg up — on mobile the eyebrow is noise the native screens do not have, and the
 * action would duplicate the raised button already sitting in the tab bar.
 */
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
        <p className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-foreground/70 lg:block">
          {eyebrow}
        </p>
        <h1 className="font-display text-[30px] font-extrabold leading-[1.05] tracking-[-0.04em] text-navy-deep lg:mt-2 lg:text-[clamp(1.9rem,4.5vw,2.6rem)] lg:tracking-[-0.035em]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-xl text-[13.5px] leading-relaxed text-fg-muted lg:mt-2 lg:text-[15px]">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="hidden h-11 items-center gap-1.5 rounded-xl bg-navy-deep px-5 text-sm font-semibold text-white transition-colors hover:bg-navy lg:inline-flex"
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
