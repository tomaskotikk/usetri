'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export type AuthState = { error?: string; notice?: string } | null

const messages: Record<string, string> = {
  invalid_credentials: 'Nesprávný e-mail nebo heslo.',
  email_not_confirmed: 'Nejdřív potvrď svůj e-mail — poslali jsme ti odkaz.',
  user_already_exists: 'Účet s tímto e-mailem už existuje. Zkus se přihlásit.',
  weak_password: 'Heslo je příliš slabé. Použij aspoň 8 znaků.',
  over_email_send_rate_limit: 'Moc pokusů za sebou. Zkus to za chvíli.',
  same_password: 'Nové heslo musí být jiné než to současné.',
  session_not_found: 'Odkaz na obnovu už není platný. Vyžádej si nový.',
}

const readable = (code?: string) => (code && messages[code]) || 'Něco se nepovedlo. Zkus to prosím znovu.'

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Vyplň e-mail i heslo.' }

  const supabase = createClient(await cookies())
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: readable(error.code) }

  redirect('/dashboard')
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!name || !email) return { error: 'Vyplň jméno a e-mail.' }
  if (password.length < 8) return { error: 'Heslo musí mít aspoň 8 znaků.' }

  const origin = (await headers()).get('origin')
  const supabase = createClient(await cookies())
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name }, emailRedirectTo: `${origin}/auth/callback` },
  })
  if (error) return { error: readable(error.code) }

  // With e-mail confirmation on, there is no session yet.
  if (!data.session) return { notice: `Poslali jsme ti potvrzovací odkaz na ${email}.` }
  redirect('/dashboard')
}

export async function logout() {
  const supabase = createClient(await cookies())
  await supabase.auth.signOut()
  redirect('/')
}

/**
 * Sends the recovery link.
 *
 * The reply is the same whether or not the address has an account — telling a
 * stranger which e-mails are registered here would turn this form into a way to
 * enumerate our users.
 */
export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { error: 'Vyplň e-mail.' }

  const origin = (await headers()).get('origin')
  const supabase = createClient(await cookies())
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/nove-heslo`,
  })

  // Only a rate limit is worth surfacing; anything else stays behind the notice.
  if (error?.code === 'over_email_send_rate_limit') return { error: readable(error.code) }

  return { notice: `Pokud u nás ${email} má účet, poslali jsme na něj odkaz pro nastavení nového hesla.` }
}

/** Sets a new password for whoever the recovery link signed in. */
export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') ?? '')
  const repeat = String(formData.get('repeat') ?? '')

  if (password.length < 8) return { error: 'Heslo musí mít aspoň 8 znaků.' }
  if (password !== repeat) return { error: 'Hesla se neshodují.' }

  const supabase = createClient(await cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: messages.session_not_found }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: readable(error.code) }

  redirect('/dashboard?heslo=zmeneno')
}
