import type { Metadata } from 'next'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { GuestGuard } from '@/features/auth/components/GuestGuard'
import { LoginForm } from '@/features/auth/components/LoginForm'

export const metadata: Metadata = {
  title: 'Login | Realtime Chat',
  description: 'Sign in to your account',
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <AuthLayout title="Welcome back" subtitle="Sign in to continue to your chat">
        <LoginForm />
      </AuthLayout>
    </GuestGuard>
  )
}
