'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { joinOffer } from '@/app/dashboard/actions'

/** Joins the invited group for a signed-in visitor and lands them on its page. */
export function InviteJoinButton({ groupId }: { groupId: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  const join = () =>
    start(async () => {
      const result = await joinOffer(groupId)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Jsi ve skupině! Teď už jen zaplatit první měsíc.')
      router.push(`/dashboard/nabidky/${groupId}`)
    })

  return (
    <button
      type="button"
      onClick={join}
      disabled={pending}
      className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-[16px] font-bold text-brand-foreground transition-colors hover:bg-brand-soft disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
      Přidat se do skupiny
    </button>
  )
}
