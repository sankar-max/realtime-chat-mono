'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function Home() {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && mounted) {
      if (user) {
        router.push('/chat')
      } else {
        router.push('/login')
      }
    }
  }, [user, isLoading, router, mounted])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-12 w-12 text-primary" />
    </div>
  )
}
