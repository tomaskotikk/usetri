// components/dashboard/PayoutAccountForm.tsx
'use client'
import { useActionState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AccountInput } from './AccountInput'
import { savePayoutAccount } from '@/app/dashboard/payment-actions'
import type { ActionState } from '@/app/dashboard/actions'

export function PayoutAccountForm({ current }: { current?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(savePayoutAccount, null)

  useEffect(() => {
    if (state?.ok) toast.success('Číslo účtu je uložené.')
  }, [state])

  return (
    <form action={action} className="space-y-3">
      <AccountInput defaultValue={current} key={current} />
      {state?.error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="h-11 gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground hover:bg-brand-soft"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Uložit účet
      </Button>
    </form>
  )
}
