'use client'

import { MessageInput } from '@/features/chat/components/MessageInput'
import { MessageList } from '@/features/chat/components/MessageList'
import { useMessages } from '@/features/chat/hooks/useMessages'
import { useRooms } from '@/features/rooms/hooks/useRooms'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoomPageClientProps {
  roomId: string
}

export function RoomPageClient({ roomId }: RoomPageClientProps) {
  const { messages, isLoading, wsStatus, sendMessage, retryFailed, dismissFailed } = useMessages(roomId)
  const { rooms } = useRooms()

  const activeRoom = rooms.find((r) => r.id === roomId)
  const roomName = activeRoom?.name || (activeRoom?.type === 'direct' ? (activeRoom.targetUserName || 'Private Message') : 'Unnamed Group')

  return (
    <div className="flex flex-1 flex-col bg-background min-h-0">
      <title>{`${roomName} | Realtime Chat`}</title>

      {/* Chat Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
            {roomName?.[0]?.toUpperCase() || 'C'}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {roomName}
            </h2>
            <p
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider',
                wsStatus === 'connected'
                  ? 'text-emerald-500'
                  : wsStatus === 'connecting'
                    ? 'text-amber-400'
                    : 'text-red-400',
              )}
            >
              {wsStatus === 'connected' ? '● Online' : wsStatus === 'connecting' ? '○ Connecting…' : '○ Offline'}
            </p>
          </div>
        </div>

        {/* WS status indicator */}
        <div className="flex items-center gap-2">
          {wsStatus === 'connected' ? (
            <Wifi className="h-4 w-4 text-emerald-500" />
          ) : wsStatus === 'connecting' ? (
            <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-400" />
          )}
        </div>
      </header>

      {/* Message list */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <MessageList
          messages={messages}
          onRetry={retryFailed}
          onDismiss={dismissFailed}
        />
      )}

      <MessageInput
        onSend={sendMessage}
        wsStatus={wsStatus}
      />
    </div>
  )
}
