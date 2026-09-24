// components/dashboard/CopyButton.tsx
'use client'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

export function CopyButton({ value, label }: { value: string; label: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`Zkopírováno: ${label}`)
    } catch {
      toast.error('Kopírování se nepovedlo.')
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Kopírovat: ${label}`}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-muted hover:text-navy-deep"
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  )
}
