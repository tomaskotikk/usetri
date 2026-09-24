'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { Loader2, Mail, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { login, signup, type AuthState } from '@/app/auth/actions'
import { AuthError, AuthNotice } from './AuthNotice'
import { AuthPanel } from './AuthPanel'
import { PasswordField } from './PasswordField'
import { field } from './field'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.28a12 12 0 0 0 0 10.74l4.01-3.09Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.63l4.01 3.09C6.23 6.88 8.88 4.77 12 4.77Z" />
    </svg>
  )
}

export function AuthForm({ mode, callbackError }: { mode: 'login' | 'signup'; callbackError?: boolean }) {
  const isLogin = mode === 'login'
  const [state, action, pending] = useActionState<AuthState, FormData>(isLogin ? login : signup, null)

  const signInWithGoogle = async () => {
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
    if (error) toast.error('Přihlášení přes Google se nepovedlo.')
  }

  const error = state?.error ?? (callbackError ? 'Odkaz už není platný. Zkus to znovu.' : undefined)

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
      mood={isLogin ? 'wave' : 'cheer'}
      title={isLogin ? 'Vítej zpátky.' : 'Začni šetřit.'}
      subtitle={isLogin ? 'Přihlas se a podívej se na své skupiny.' : 'Založ si účet a přidej se k první skupině.'}
    >
      <Button
        type="button"
        variant="outline"
        onClick={signInWithGoogle}
        className="mt-8 h-12 w-full gap-3 rounded-xl bg-white text-[15px] font-semibold text-navy-deep hover:bg-muted"
      >
        <GoogleIcon /> Pokračovat přes Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-fg-muted/70">
        <span className="h-px flex-1 bg-border" /> nebo <span className="h-px flex-1 bg-border" />
      </div>

      <form action={action} className="space-y-3.5">
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
            <input name="name" required autoComplete="name" placeholder="Jméno" aria-label="Jméno" className={field} />
          </div>
        )}

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

        <PasswordField
          name="password"
          label="Heslo"
          placeholder={isLogin ? 'Heslo' : 'Heslo (min. 8 znaků)'}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          minLength={isLogin ? undefined : 8}
          meter={!isLogin}
        />

        {isLogin && (
          <div className="flex justify-end">
            <Link
              href="/zapomenute-heslo"
              className="text-sm font-medium text-fg-muted underline-offset-4 transition-colors hover:text-navy-deep hover:underline"
            >
              Zapomenuté heslo?
            </Link>
          </div>
        )}

        {error && <AuthError>{error}</AuthError>}

        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-brand text-base font-semibold text-brand-foreground hover:bg-brand-soft"
        >
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLogin ? 'Přihlásit se' : 'Vytvořit účet'}
        </Button>

        {!isLogin && (
          <p className="text-center text-[12px] text-fg-muted">
            Registrací potvrzuješ, že ti je alespoň 18 let a souhlasíš s{' '}
            <Link href="/podminky" className="underline underline-offset-2 hover:text-navy-deep">
              podmínkami
            </Link>
            .
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        {isLogin ? 'Nemáš účet?' : 'Už máš účet?'}{' '}
        <Link
          href={isLogin ? '/registrace' : '/prihlaseni'}
          className="font-semibold text-navy-deep underline-offset-4 hover:underline"
        >
          {isLogin ? 'Zaregistruj se' : 'Přihlas se'}
        </Link>
      </p>
    </AuthPanel>
  )
}
