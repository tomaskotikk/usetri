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
