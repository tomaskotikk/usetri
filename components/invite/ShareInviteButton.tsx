'use client'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { inviteMessage, invitePath } from '@/lib/invite'

/**
 * Sends the group's invite link: the system share sheet where there is one (phones,
 * Safari), otherwise the clipboard. The link previews as the invite card.
 */
export function ShareInviteButton({
  groupId,
  serviceName,
  pricePerSeat,
  fullPrice,
}: {
  groupId: string
  serviceName: string
  pricePerSeat: number
  fullPrice: number
}) {
  const share = async () => {
    const url = `${window.location.origin}${invitePath(groupId)}`
    const text = inviteMessage(serviceName, pricePerSeat, fullPrice)

    if (navigator.share) {
      try {
        await navigator.share({ title: `Pozvánka do skupiny ${serviceName}`, text, url })
        return
      } catch (error) {
        // Closing the sheet is not a failure worth a toast.
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`)
      toast.success('Odkaz na pozvánku je zkopírovaný. Pošli ho komukoli.')
    } catch {
      toast.error('Odkaz se nepodařilo zkopírovat.')
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-soft"
    >
      <Share2 className="h-4 w-4" /> Pozvat
    </button>
  )
}
