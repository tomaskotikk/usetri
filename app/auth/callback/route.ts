import { cookies } from 'next/headers'
import { NextResponse, after } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendWelcome } from '@/lib/email/send'
import { safeNext } from '@/lib/invite'

// Handles the link from the confirmation e-mail and the return from Google OAuth.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Recovery links ask to land on /nove-heslo, invites on their /pozvanka page.
  const target = safeNext(searchParams.get('next'))

  if (code) {
    const supabase = createClient(await cookies())
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // A password recovery also lands here; a welcome then would be nonsense.
      if (target !== '/nove-heslo') await welcomeOnce(supabase, origin)
      return NextResponse.redirect(`${origin}${target}`)
    }
  }
  return NextResponse.redirect(`${origin}/prihlaseni?error=callback`)
}

type Supabase = Awaited<ReturnType<typeof createClient>>

/**
 * The welcome goes out the first time an account reaches a real session, which
 * is the moment it is genuinely usable — after the confirmation link, or after
 * the first Google sign-in.
 *
 * The flag lives in user_metadata, so this needs no migration and no service
 * role key. It is written before the send: a lost e-mail is better than one
 * sent twice, and only a written flag guarantees that.
 */
async function welcomeOnce(supabase: Supabase, origin: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email || user.user_metadata?.welcomed) return

  const { error } = await supabase.auth.updateUser({ data: { welcomed: true } })
  if (error) return

  const { email, user_metadata: meta } = user
  after(() => sendWelcome(email, meta?.full_name ?? meta?.name, origin))
}
