import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = { title: 'Přihlášení — Ušetři' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  return (
    <AuthShell>
      <AuthForm mode="login" callbackError={!!error} />
    </AuthShell>
  )
}
