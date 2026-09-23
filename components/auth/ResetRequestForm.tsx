'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requestPasswordReset, type AuthState } from '@/app/auth/actions'
import { AuthError, AuthNotice } from './AuthNotice'
import { AuthPanel } from './AuthPanel'
import { field } from './field'

export function ResetRequestForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, null)

  if (state?.notice) {
    return (
      <AuthNotice
        title="Zkontroluj e-mail"
        message={state.notice}
        hint="Odkaz platí hodinu. Nepřišel? Mrkni do spamu."
      />
    )
  }

  return (
    <AuthPanel
      mood="search"
      title="Zapomenuté heslo"
      subtitle="Napiš e-mail a pošleme ti odkaz na nastavení nového hesla."
    >
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

        {state?.error && <AuthError>{state.error}</AuthError>}

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
    </AuthPanel>
  )
}
