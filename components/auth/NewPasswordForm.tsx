'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updatePassword, type AuthState } from '@/app/auth/actions'
import { AuthError } from './AuthNotice'
import { AuthPanel } from './AuthPanel'
import { PasswordField } from './PasswordField'

export function NewPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, null)

  return (
    <AuthPanel mood="think" title="Nové heslo" subtitle="Zadej ho dvakrát, ať se nespleteš.">
      <form action={action} className="mt-8 space-y-3.5">
        <PasswordField
          name="password"
          label="Nové heslo"
          placeholder="Nové heslo (min. 8 znaků)"
          autoComplete="new-password"
          minLength={8}
          meter
        />
        <PasswordField
          name="repeat"
          label="Heslo znovu"
          placeholder="Heslo znovu"
          autoComplete="new-password"
          minLength={8}
        />

        {state?.error && <AuthError>{state.error}</AuthError>}

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
    </AuthPanel>
  )
}
