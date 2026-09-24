// components/dashboard/PaymentCard.tsx
import { CheckCircle2, Clock } from 'lucide-react'
import { CopyButton } from './CopyButton'
import { ReportPaidButton, UndoReportButton } from './PaymentActions'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { formatDate } from '@/lib/billing'
import { formatCzk } from '@/lib/format'
import { qrSvg } from '@/lib/qr'
import { buildSpd, paymentMessage } from '@/lib/spd'
import type { PayoutAccount, PeriodView } from '@/lib/payments'

export async function PaymentCard({
  groupId,
  serviceName,
  payerName,
  account,
  vs,
  view,
}: {
  groupId: string
  serviceName: string
  payerName: string
  account: PayoutAccount | null
  vs: number
  view: PeriodView
}) {
  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-display text-lg font-bold tracking-tight text-navy-deep">
        {formatCzk(view.amount)} <span className="font-sans text-sm font-medium text-fg-muted">splatné {formatDate(view.period)}</span>
      </h2>
      <PaymentStatusBadge status={view.status} />
    </div>
  )

  if (view.status === 'paid') {
    return (
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        {header}
        <p className="mt-3 flex items-center gap-2 text-sm text-fg-muted">
          <CheckCircle2 className="h-4 w-4 text-brand" /> Zakladatel platbu potvrdil. Tenhle měsíc máš vyřízený.
        </p>
      </section>
    )
  }

  if (!account) {
    return (
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        {header}
        <p className="mt-3 text-sm text-fg-muted">
          Zakladatel ještě nezadal číslo účtu. Jakmile ho doplní, objeví se tu QR platba.
        </p>
      </section>
    )
  }

  const message = paymentMessage(serviceName, view.period, payerName)
  const svg = await qrSvg(buildSpd({ iban: account.iban, amount: view.amount, vs, message }))
  const rows = [
    { label: 'Účet', shown: account.display, copy: account.display },
    { label: 'Částka', shown: formatCzk(view.amount), copy: String(view.amount) },
    { label: 'VS', shown: String(vs), copy: String(vs) },
    { label: 'Zpráva', shown: message, copy: message },
  ]

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      {header}

      <div className="mt-5 flex flex-col gap-5 sm:flex-row">
        {/* SVG comes from our own QR renderer, not user input. */}
        <div
          className="mx-auto h-44 w-44 shrink-0 rounded-2xl border border-border bg-white p-3 sm:mx-0 [&>svg]:h-full [&>svg]:w-full"
          aria-label="QR platba — naskenuj ji v aplikaci své banky"
          role="img"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <dl className="min-w-0 flex-1 divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 py-2">
              <dt className="w-16 shrink-0 text-[11px] uppercase tracking-widest text-fg-muted">{row.label}</dt>
              <dd className="min-w-0 flex-1 truncate font-mono text-[13px] text-navy-deep">{row.shown}</dd>
              <CopyButton value={row.copy} label={row.label} />
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-5">
        {view.status === 'reported' && view.paymentId ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted px-4 py-3">
            <p className="flex items-center gap-2 text-sm text-navy-deep">
              <Clock className="h-4 w-4 text-fg-muted" /> Čeká na potvrzení od zakladatele
            </p>
            <UndoReportButton paymentId={view.paymentId} />
          </div>
        ) : (
          <ReportPaidButton groupId={groupId} period={view.period} />
        )}
      </div>
    </section>
  )
}
