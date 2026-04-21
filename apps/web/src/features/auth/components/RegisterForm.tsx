'use client'

import { type RegisterInput, registerSchema } from '@chat/validation'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '../hooks/useAuth'

export function RegisterForm() {
  const { register: registerUser, isRegistering } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: standardSchemaResolver(registerSchema),
  })

  const onSubmit = (data: RegisterInput) => {
    registerUser(data)
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field>
          <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
          <Input
            id="displayName"
            type="text"
            placeholder="John Doe"
            className="h-11 rounded-xl bg-zinc-50/50 px-4 transition-all focus:bg-white dark:bg-zinc-900/50 dark:focus:bg-zinc-900"
            {...register('displayName')}
            aria-invalid={!!errors.displayName}
          />
          <FieldError errors={[errors.displayName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="h-11 rounded-xl bg-zinc-50/50 px-4 transition-all focus:bg-white dark:bg-zinc-900/50 dark:focus:bg-zinc-900"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-11 rounded-xl bg-zinc-50/50 px-4 transition-all focus:bg-white dark:bg-zinc-900/50 dark:focus:bg-zinc-900"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Button
          type="submit"
          className="h-11 w-full rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          disabled={isRegistering}
        >
          {isRegistering ? 'Creating account...' : 'Create an account'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-zinc-500 dark:bg-black">Or join with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-11 rounded-xl border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900"
        >
          Google
        </Button>
        <Button
          variant="outline"
          className="h-11 rounded-xl border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900"
        >
          GitHub
        </Button>
      </div>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  )
}
