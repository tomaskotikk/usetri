'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Loader2, Mail, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requestPasswordReset, type AuthState } from '@/app/auth/actions'
import { field } from './field'

export function ResetRequestForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, null)

  if (state?.notice) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-brand/15 text-brand">
          <MailCheck className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-deep">Zkontroluj e-mail</h1>
        <p className="mt-3 text-fg-muted">{state.notice}</p>
        <p className="mt-2 text-sm text-fg-muted/80">Odkaz platí hodinu. Nepřišel? Mrkni do spamu.</p>
        <Link
          href="/prihlaseni"
          className="mt-8 inline-block text-sm font-semibold text-navy-deep underline-offset-4 hover:underline"
        >
          Zpět na přihlášení
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.03em] text-navy-deep">
        Zapomenuté heslo
      </h1>
      <p className="mt-2 text-fg-muted">Napiš e-mail a pošleme ti odkaz na nastavení nového hesla.</p>

      <form action={action} className="mt-8 space-y-3.5">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="E-mail"
            aria-label="E-mail"
            className={field}
          />
        </div>

        {state?.error && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-brand text-base font-semibold text-brand-foreground hover:bg-brand-soft"
        >
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Poslat odkaz
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        Vzpomněl sis?{' '}
        <Link href="/prihlaseni" className="font-semibold text-navy-deep underline-offset-4 hover:underline">
          Přihlas se
        </Link>
      </p>
    </div>
  )
}
