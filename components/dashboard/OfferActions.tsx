'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Lock, LockOpen, Trash2, UserMinus, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  deleteOffer,
  joinOffer,
  leaveOffer,
  removeMember,
  setOfferClosed,
  type ActionState,
} from '@/app/dashboard/actions'

export function useAction() {
  const [pending, start] = useTransition()
  const router = useRouter()

  const run = (fn: () => Promise<ActionState>, success: string, confirmText?: string) => () => {
    if (confirmText && !window.confirm(confirmText)) return
    start(async () => {
      const result = await fn()
      if (result?.error) toast.error(result.error)
      else {
        toast.success(success)
        router.refresh()
      }
    })
  }

  return { pending, run }
}

const spinner = <Loader2 className="h-4 w-4 animate-spin" />

export function JoinButton({ groupId, full = false }: { groupId: string; full?: boolean }) {
  const { pending, run } = useAction()
  return (
    <Button
      disabled={pending}
      onClick={run(() => joinOffer(groupId), 'Jsi ve skupině. Zakladatel tě přidá do plánu.')}
      className={`h-10 gap-2 rounded-xl bg-brand px-4 font-semibold text-brand-foreground hover:bg-brand-soft ${full ? 'w-full' : ''}`}
    >
      {pending ? spinner : <UserPlus className="h-4 w-4" />} Přidat se
    </Button>
  )
}

export function LeaveButton({ groupId, full = false }: { groupId: string; full?: boolean }) {
  const { pending, run } = useAction()
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={run(() => leaveOffer(groupId), 'Odešel jsi ze skupiny.', 'Opravdu chceš ze skupiny odejít?')}
      className={`h-10 gap-2 rounded-xl bg-white px-4 text-navy-deep ${full ? 'w-full' : ''}`}
    >
      {pending ? spinner : <LogOut className="h-4 w-4" />} Odejít
    </Button>
  )
}

export function ToggleClosedButton({ groupId, closed }: { groupId: string; closed: boolean }) {
  const { pending, run } = useAction()
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={run(
        () => setOfferClosed(groupId, !closed),
        closed ? 'Nabídka je zase veřejná.' : 'Nabídka je uzavřená.',
      )}
      className="h-10 gap-2 rounded-xl bg-white px-4 text-navy-deep"
    >
      {pending ? spinner : closed ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
      {closed ? 'Otevřít znovu' : 'Uzavřít nábor'}
    </Button>
  )
}

export function DeleteOfferButton({ groupId }: { groupId: string }) {
  const { pending, run } = useAction()
  return (
    <Button
      variant="ghost"
      disabled={pending}
      onClick={run(
        () => deleteOffer(groupId),
        'Nabídka byla smazána.',
        'Smazat nabídku i se všemi členy? Tohle nejde vrátit.',
      )}
      className="h-10 gap-2 rounded-xl px-4 text-destructive hover:bg-destructive/10"
    >
      {pending ? spinner : <Trash2 className="h-4 w-4" />} Smazat
    </Button>
  )
}

export function RemoveMemberButton({ groupId, userId, name }: { groupId: string; userId: string; name: string }) {
  const { pending, run } = useAction()
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label={`Odebrat ${name}`}
      onClick={run(() => removeMember(groupId, userId), `${name} byl odebrán.`, `Odebrat ${name} ze skupiny?`)}
      className="h-8 gap-1.5 rounded-lg px-2 text-fg-muted hover:text-destructive"
    >
      {pending ? spinner : <UserMinus className="h-3.5 w-3.5" />}
    </Button>
  )
}
