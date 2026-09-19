'use client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function JoinButton({
  label = 'Přidat se',
  variant = 'primary',
  full = false,
}: {
  label?: string
  variant?: 'primary' | 'ghost'
  full?: boolean
}) {
  return (
    <Button
      onClick={() => toast('Platby zatím nejsou napojené — tohle je jen ukázka.')}
      className={`rounded-xl ${full ? 'w-full' : ''} ${
        variant === 'primary'
          ? 'bg-brand text-brand-foreground hover:bg-brand-soft'
          : 'bg-white text-navy-deep border border-border hover:bg-secondary'
      }`}
    >
      {label}
    </Button>
  )
}
