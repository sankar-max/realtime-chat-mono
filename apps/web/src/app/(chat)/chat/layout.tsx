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
        <div className="flex flex-1 overflow-hidden relative">
          {/* Rooms Sidebar - Hidden on mobile if a room is active */}
          <div 
            className={`w-full md:w-80 flex-shrink-0 border-r bg-background md:block ${roomId ? 'hidden' : 'block'}`}
          >
            <RoomSidebar activeRoomId={roomId} onRoomSelect={handleRoomSelect} />
          </div>

          {/* Main Chat Content Area - Hidden on mobile if no room is active */}
          <div 
            className={`flex-1 overflow-hidden bg-background md:flex ${roomId ? 'flex' : 'hidden'}`}
          >
            {children}
          </div>
        </div>
      </ChatLayout>
    </AuthGuard>
  )
}
