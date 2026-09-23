import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth/AuthShell'
import { NewPasswordForm } from '@/components/auth/NewPasswordForm'
import { createClient } from '@/utils/supabase/server'

export const metadata: Metadata = { title: 'Nové heslo' }

export default async function NewPasswordPage() {
  // Only reachable with the session the recovery link created. Without it there
  // is nobody to change the password for, so send them back to ask for a new link.
  const supabase = createClient(await cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/zapomenute-heslo')

  return (
    <AuthShell>
      <NewPasswordForm />
    </AuthShell>
  )
}
