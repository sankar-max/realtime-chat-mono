'use client'

import { LogOutIcon, MessageSquareIcon, UserCircleIcon } from 'lucide-react'
import type React from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ProfileDialog } from '@/features/auth/components/ProfileDialog'

interface ChatLayoutProps {
  children: React.ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const { logout, user } = useAuth()

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      {/* Primary Sidebar (Icons) */}
      <aside
        className="flex w-16 flex-col items-center justify-between border-r bg-background py-4"
        aria-label="Primary Navigation"
      >
        <nav className="flex flex-col items-center gap-4" aria-label="Quick Actions">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            role="img"
            aria-label="Logo"
          >
            <MessageSquareIcon className="h-6 w-6" />
          </div>
        </nav>
        
        <div className="flex flex-col items-center gap-2">
          <ProfileDialog>
            <Button
              variant="ghost"
              size="icon"
              title="Profile Settings"
              aria-label="Edit Profile"
              className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  className="h-8 w-8 rounded-full object-cover" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.dataset.error) {
                      target.dataset.error = 'true';
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=random`;
                    }
                  }}
                />
              ) : (
                <UserCircleIcon className="h-6 w-6" />
              )}
            </Button>
          </ProfileDialog>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            title="Logout"
            aria-label="Log out of account"
            className="text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
          >
            <LogOutIcon className="h-5 w-5" />
          </Button>
        </div>
      </aside>

      {/* Page Content */}
      <main className="flex flex-1 overflow-hidden bg-background" role="main">
        {children}
      </main>
    </div>
  )
}
