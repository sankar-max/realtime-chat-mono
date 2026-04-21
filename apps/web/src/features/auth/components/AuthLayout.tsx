import { MessageSquareIcon } from 'lucide-react'
import type React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh w-full overflow-hidden bg-white dark:bg-black">
      <div className="relative hidden w-1/2 flex-col justify-between bg-zinc-900 p-12 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex items-center gap-2 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <MessageSquareIcon className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Realtime Chat</span>
        </div>

        <div className="relative z-10">
          <blockquote className="space-y-4">
            <p className="text-3xl font-medium leading-tight text-zinc-100">
              "Experience the next generation of real-time communication with lightning-fast delivery and premium
              security."
            </p>
            <footer className="text-lg text-zinc-400">— The Realtime Team</footer>
          </blockquote>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-zinc-500">
          <span>&copy; {new Date().getFullYear()} Realtime Chat Inc.</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span>Privacy Policy</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span>Terms of Service</span>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex w-full items-center justify-center px-8 lg:w-1/2">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <div className="flex justify-center lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                <MessageSquareIcon className="h-7 w-7" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
            {subtitle && <p className="text-balance text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">{children}</div>
        </div>
      </div>
    </div>
  )
}
