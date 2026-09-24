import type { PeriodStatus } from '@/lib/billing'

const STYLES: Record<PeriodStatus, { label: string; className: string }> = {
  paid: { label: 'Zaplaceno', className: 'bg-brand/15 text-brand-foreground' },
  reported: { label: 'Čeká na potvrzení', className: 'bg-amber-100 text-amber-800' },
  due: { label: 'K zaplacení', className: 'bg-muted text-navy-deep' },
  overdue: { label: 'Po splatnosti', className: 'bg-destructive/10 text-destructive' },
}

export function PaymentStatusBadge({ status }: { status: PeriodStatus }) {
  const { label, className } = STYLES[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`}>
      {label}
    </span>
  )
}
