'use client'

import { LogOutIcon, MessageSquareIcon } from 'lucide-react'
import type React from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface ChatLayoutProps {
  children: React.ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const { logout } = useAuth()

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-zinc-50 dark:bg-black">
      {/* Primary Sidebar (Icons) */}
      <aside
        className="flex w-16 flex-col items-center justify-between border-r bg-white py-4 dark:border-zinc-800 dark:bg-zinc-950"
        aria-label="Primary Navigation"
      >
        <nav className="flex flex-col items-center gap-4" aria-label="Quick Actions">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20"
            role="img"
            aria-label="Logo"
          >
            <MessageSquareIcon className="h-6 w-6" />
          </div>
        </nav>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => logout()}
          title="Logout"
          aria-label="Log out of account"
          className="text-zinc-500 hover:text-destructive transition-colors"
        >
          <LogOutIcon className="h-5 w-5" />
        </Button>
      </aside>

      {/* Page Content */}
      <main className="flex flex-1 overflow-hidden" role="main">
        {children}
      </main>
    </div>
  )
}
