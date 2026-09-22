import Link from 'next/link'

export function EmptyState({
  icon: Icon,
  title,
  text,
  primary,
  secondary,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  text: string
  primary?: { href: string; label: string; icon?: React.ComponentType<{ className?: string }> }
  secondary?: { href: string; label: string }
}) {
  const PrimaryIcon = primary?.icon
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/12 text-brand ring-8 ring-brand/5">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-navy-deep">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-fg-muted">{text}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {primary && (
          <Link
            href={primary.href}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-soft"
          >
            {PrimaryIcon && <PrimaryIcon className="h-4 w-4" />} {primary.label}
          </Link>
        )}
        {secondary && (
          <Link
            href={secondary.href}
            className="inline-flex h-11 items-center rounded-xl border border-border bg-white px-5 text-sm font-medium text-navy-deep transition-colors hover:bg-muted"
          >
            {secondary.label}
          </Link>
        )}
      </div>
    </div>
  )
}
