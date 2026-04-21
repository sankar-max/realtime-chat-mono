'use client'

import { useParams, useRouter } from 'next/navigation'
import type React from 'react'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { ChatLayout } from '@/features/chat/components/ChatLayout'
import { RoomSidebar } from '@/features/rooms/components/RoomSidebar'

export default function ChatMainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const params = useParams()
  const roomId = params.roomId as string | undefined

  const handleRoomSelect = (id: string) => {
    router.push(`/chat/${id}`)
  }

  return (
    <AuthGuard>
      <ChatLayout>
        <div className="flex flex-1 overflow-hidden">
          {/* Rooms Sidebar - Persistent */}
          <div className="w-80 border-r bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <RoomSidebar activeRoomId={roomId} onRoomSelect={handleRoomSelect} />
          </div>

          {/* Main Chat Content Area */}
          <div className="flex flex-1 overflow-hidden">{children}</div>
        </div>
      </ChatLayout>
    </AuthGuard>
  )
}
