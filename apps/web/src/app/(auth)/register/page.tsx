import type { Metadata } from 'next'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { GuestGuard } from '@/features/auth/components/GuestGuard'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export const metadata: Metadata = {
  title: 'Register | Realtime Chat',
  description: 'Create a new account',
}

export default function RegisterPage() {
  return (
    <GuestGuard>
      <AuthLayout title="Create an account" subtitle="Join our community today">
        <RegisterForm />
      </AuthLayout>
    </GuestGuard>
  )
}
