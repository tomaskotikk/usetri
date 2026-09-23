import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { ResetRequestForm } from '@/components/auth/ResetRequestForm'

export const metadata: Metadata = { title: 'Zapomenuté heslo' }

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ResetRequestForm />
    </AuthShell>
  )
}
