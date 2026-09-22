'use client'
import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Lock, Mail, MailCheck, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { login, signup, type AuthState } from '@/app/auth/actions'

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

const field =
  'h-12 w-full rounded-xl border border-border bg-white pl-11 pr-4 text-[15px] text-navy-deep outline-none transition placeholder:text-fg-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/15'

export function AuthForm({ mode, callbackError }: { mode: 'login' | 'signup'; callbackError?: boolean }) {
  const isLogin = mode === 'login'
  const [state, action, pending] = useActionState<AuthState, FormData>(isLogin ? login : signup, null)
  const [show, setShow] = useState(false)
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
      <div className="text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-brand/15 text-brand">
          <MailCheck className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-deep">Zkontroluj e-mail</h1>
        <p className="mt-3 text-fg-muted">{state.notice}</p>
        <Link href="/prihlaseni" className="mt-8 inline-block text-sm font-semibold text-navy-deep underline-offset-4 hover:underline">
          Zpět na přihlášení
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.03em] text-navy-deep">
        {isLogin ? 'Vítej zpátky.' : 'Začni šetřit.'}
      </h1>
      <p className="mt-2 text-fg-muted">
        {isLogin ? 'Přihlas se a podívej se na své skupiny.' : 'Založ si účet a přidej se k první skupině.'}
      </p>

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
          <input name="email" type="email" required autoComplete="email" placeholder="E-mail" aria-label="E-mail" className={field} />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            name="password"
            type={show ? 'text' : 'password'}
            required
            minLength={isLogin ? undefined : 8}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            placeholder={isLogin ? 'Heslo' : 'Heslo (min. 8 znaků)'}
            aria-label="Heslo"
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

        {error && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-brand text-base font-semibold text-brand-foreground hover:bg-brand-soft"
        >
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLogin ? 'Přihlásit se' : 'Vytvořit účet'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        {isLogin ? 'Nemáš účet?' : 'Už máš účet?'}{' '}
        <Link href={isLogin ? '/registrace' : '/prihlaseni'} className="font-semibold text-navy-deep underline-offset-4 hover:underline">
          {isLogin ? 'Zaregistruj se' : 'Přihlas se'}
        </Link>
      </p>
    </div>
  )
}
