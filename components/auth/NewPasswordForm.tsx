'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updatePassword, type AuthState } from '@/app/auth/actions'
import { field } from './field'

export function NewPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, null)
  const [show, setShow] = useState(false)

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.03em] text-navy-deep">
        Nové heslo
      </h1>
      <p className="mt-2 text-fg-muted">Zadej ho dvakrát, ať se nespleteš.</p>

      <form action={action} className="mt-8 space-y-3.5">
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            name="password"
            type={show ? 'text' : 'password'}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Nové heslo (min. 8 znaků)"
            aria-label="Nové heslo"
            className={`${field} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Skrýt heslo' : 'Zobrazit heslo'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-fg-muted hover:text-navy-deep"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            name="repeat"
            type={show ? 'text' : 'password'}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Heslo znovu"
            aria-label="Heslo znovu"
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
          Uložit heslo
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        Odkaz vypršel?{' '}
        <Link href="/zapomenute-heslo" className="font-semibold text-navy-deep underline-offset-4 hover:underline">
          Vyžádej si nový
        </Link>
      </p>
    </div>
  )
}
