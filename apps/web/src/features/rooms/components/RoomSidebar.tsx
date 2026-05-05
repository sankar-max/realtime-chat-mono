'use client'

import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useRooms } from '../hooks/useRooms'
import { CreateChatDialog } from './CreateChatDialog'
import { usePresenceStore } from '@/store/usePresenceStore'

interface RoomSidebarProps {
  activeRoomId?: string
  onRoomSelect: (roomId: string) => void
}

export function RoomSidebar({ activeRoomId, onRoomSelect }: RoomSidebarProps) {
  const { rooms, isLoading } = useRooms()
  const onlineUsers = usePresenceStore((s) => s.onlineUsers)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
        <h3 className="text-xl font-bold">Chats</h3>
        <CreateChatDialog />
      </div>
      <nav className="flex-1 overflow-y-auto" aria-label="Conversation list">
        <div role="list">
          <AnimatePresence mode="popLayout">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <motion.button
                  key={room.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => onRoomSelect(room.id)}
                  role="listitem"
                  aria-selected={activeRoomId === room.id}
                  aria-label={`Chat with ${room.name || (room.type === 'direct' ? 'Private Message' : 'Unnamed Group')}`}
                  className={cn(
                    'flex w-full items-center gap-4 p-4 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 focus-visible:outline-none focus-visible:bg-zinc-100 dark:focus-visible:bg-zinc-900',
                    activeRoomId === room.id && 'bg-zinc-100 dark:bg-zinc-900',
                  )}
                >
                  <div className="relative" aria-hidden="true">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {room.name?.[0]?.toUpperCase() || 'C'}
                    </div>
                    {/* For direct messages, we should ideally know the other user's ID, but for now we'll just skip or parse if possible. Wait, room doesn't return targetUserId directly. 
                        Let's just show the unread badge. To do online presence for DMs perfectly, we need the other user's ID from the room object.
                        Since room object doesn't have it directly, we will just use the unread badge for now, and handle DM online status in the chat header or if room has targetUserId. */}
                    {room.unreadCount && room.unreadCount > 0 ? (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                        {room.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
                    <div className="flex w-full items-center justify-between">
                      <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                        {room.name || (room.type === 'direct' ? 'Private Message' : 'Unnamed Group')}
                      </span>
                      {room.lastMessageAt && (
                        <span className="text-[10px] text-zinc-500">
                          {format(new Date(room.lastMessageAt), 'HH:mm')}
                        </span>
                      )}
                    </div>
                    <span className="truncate text-xs text-zinc-500">{room.lastMessage || 'No messages yet'}</span>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center opacity-50" role="status">
                <p className="text-sm">No rooms found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </div>
  )
}
