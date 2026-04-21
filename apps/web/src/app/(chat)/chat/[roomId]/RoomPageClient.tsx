'use client'

import { MessageInput } from '@/features/chat/components/MessageInput'
import { MessageList } from '@/features/chat/components/MessageList'
import { useMessages } from '@/features/chat/hooks/useMessages'
import { useRooms } from '@/features/rooms/hooks/useRooms'

interface RoomPageClientProps {
  roomId: string
}

export function RoomPageClient({ roomId }: RoomPageClientProps) {
  const { messages, sendMessage } = useMessages(roomId)
  const { rooms } = useRooms()

  const activeRoom = rooms.find((r) => r.id === roomId)
  const roomName = activeRoom?.name || (activeRoom?.type === 'direct' ? 'Private Message' : 'Unnamed Group')

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      {/* Client-side dynamic title fallback */}
      <title>{`${roomName} | Realtime Chat`}</title>

      {/* Chat Header */}
      <header className="flex h-16 items-center justify-between border-b bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {activeRoom?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div>
            <h2 className="font-semibold">
              {activeRoom?.name || (activeRoom?.type === 'direct' ? 'Private Message' : 'Unnamed Group')}
            </h2>
            <p className="text-[10px] text-green-500 font-medium uppercase tracking-wider">Online</p>
          </div>
        </div>
      </header>

      <MessageList messages={messages} />

      <MessageInput onSend={(content) => sendMessage({ roomId, content })} />
    </div>
  )
}
