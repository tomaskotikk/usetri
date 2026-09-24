// components/dashboard/PaymentInbox.tsx
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ServiceIcon } from '@/components/illustrations/ServiceIcon'
import { ConfirmPaymentButton, RejectPaymentButton } from './PaymentActions'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { formatDate } from '@/lib/billing'
import { formatCzk } from '@/lib/format'
import type { InboxItem } from '@/lib/payments'

export function PaymentInbox({ toPay, toConfirm }: { toPay: InboxItem[]; toConfirm: InboxItem[] }) {
  if (toPay.length === 0 && toConfirm.length === 0) return null

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {toPay.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold tracking-tight text-navy-deep">K zaplacení</h2>
          <ul className="mt-3 divide-y divide-border">
            {toPay.map((item) => (
              <li key={`${item.groupId}-${item.period}`}>
                <Link href={`/dashboard/nabidky/${item.groupId}`} className="flex items-center gap-3 py-3">
                  <ServiceIcon service={item.service} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-navy-deep">{item.service.name}</span>
                    <span className="block text-[12px] text-fg-muted">splatné {formatDate(item.period)}</span>
                  </span>
                  <span className="font-mono text-sm font-semibold text-navy-deep">{formatCzk(item.amount)}</span>
                  <PaymentStatusBadge status={item.status} />
                  <ChevronRight className="h-4 w-4 text-fg-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {toConfirm.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold tracking-tight text-navy-deep">
            Čeká na potvrzení <span className="font-sans text-sm font-medium text-fg-muted">{toConfirm.length}</span>
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {toConfirm.map((item) => (
              <li key={item.paymentId} className="flex flex-wrap items-center gap-3 py-3">
                <ServiceIcon service={item.service} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-navy-deep">{item.payerName}</span>
                  <span className="block text-[12px] text-fg-muted">
                    {item.service.name} · {formatCzk(item.amount)} · {formatDate(item.period)}
                  </span>
                </span>
                <ConfirmPaymentButton paymentId={item.paymentId!} />
                <RejectPaymentButton paymentId={item.paymentId!} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
