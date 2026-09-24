'use client'
import { Check, Loader2, Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAction } from './OfferActions'
import {
  confirmPayment,
  markPaid,
  rejectPayment,
  reportPayment,
  undoReport,
} from '@/app/dashboard/payment-actions'
import type { PeriodView } from '@/lib/payments'

const spinner = <Loader2 className="h-4 w-4 animate-spin" />

export function ReportPaidButton({ groupId, period }: { groupId: string; period: string }) {
  const { pending, run } = useAction()
  return (
    <Button
      disabled={pending}
      onClick={run(() => reportPayment(groupId, period), 'Díky! Zakladatel teď platbu potvrdí.')}
      className="h-11 w-full gap-2 rounded-xl bg-brand font-semibold text-brand-foreground hover:bg-brand-soft"
    >
      {pending ? spinner : <Check className="h-4 w-4" />} Zaplatil jsem
    </Button>
  )
}

export function UndoReportButton({ paymentId }: { paymentId: string }) {
  const { pending, run } = useAction()
  return (
    <Button
      variant="ghost"
      disabled={pending}
      onClick={run(() => undoReport(paymentId), 'Nahlášení je zrušené.')}
      className="h-9 gap-1.5 rounded-xl px-3 text-sm text-fg-muted"
    >
      {pending ? spinner : <Undo2 className="h-4 w-4" />} Vzít zpět
    </Button>
  )
}

export function ConfirmPaymentButton({ paymentId }: { paymentId: string }) {
  const { pending, run } = useAction()
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={run(() => confirmPayment(paymentId), 'Platba potvrzena.')}
      className="h-8 gap-1.5 rounded-lg bg-brand px-2.5 text-[13px] font-semibold text-brand-foreground hover:bg-brand-soft"
    >
      {pending ? spinner : <Check className="h-3.5 w-3.5" />} Potvrdit
    </Button>
  )
}

export function RejectPaymentButton({ paymentId }: { paymentId: string }) {
  const { pending, run } = useAction()
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={run(
        () => rejectPayment(paymentId),
        'Platba vrácena mezi nezaplacené.',
        'Platba ti nedorazila? Člen ji uvidí znovu jako nezaplacenou.',
      )}
      className="h-8 gap-1.5 rounded-lg px-2.5 text-[13px] text-fg-muted hover:text-destructive"
    >
      {pending ? spinner : <X className="h-3.5 w-3.5" />} Nedorazilo
    </Button>
  )
}

export function MarkPaidButton({ groupId, userId, period }: { groupId: string; userId: string; period: string }) {
  const { pending, run } = useAction()
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={run(() => markPaid(groupId, userId, period), 'Zapsáno jako zaplacené.')}
      className="h-8 gap-1.5 rounded-lg px-2.5 text-[13px] text-fg-muted hover:text-navy-deep"
    >
      {pending ? spinner : <Check className="h-3.5 w-3.5" />} Označit jako zaplacené
    </Button>
  )
}

/** What the owner can do about one member's current period. */
export function MemberPaymentControls({ groupId, userId, view }: { groupId: string; userId: string; view: PeriodView }) {
  if (view.status === 'reported' && view.paymentId) {
    return (
      <>
        <ConfirmPaymentButton paymentId={view.paymentId} />
        <RejectPaymentButton paymentId={view.paymentId} />
      </>
    )
  }
  if (view.status === 'due' || view.status === 'overdue') {
    return <MarkPaidButton groupId={groupId} userId={userId} period={view.period} />
  }
  return null
}
