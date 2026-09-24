import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { AuthForm } from '@/components/auth/AuthForm'
import { safeNext } from '@/lib/invite'

export const metadata: Metadata = { title: 'Přihlášení — Ušetři' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  return (
    <AuthShell>
      <AuthForm mode="login" callbackError={!!error} next={next ? safeNext(next) : undefined} />
    </AuthShell>
  )
}
