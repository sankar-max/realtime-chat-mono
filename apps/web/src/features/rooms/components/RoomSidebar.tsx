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
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-xl font-bold">Chats</h3>
        <CreateChatDialog />
      </div>
      <nav className="flex-1 overflow-y-auto" aria-label="Conversation list">
        <div role="list">
          <AnimatePresence mode="popLayout">
            {rooms.length > 0 ? (
              rooms.map((room) => {
                  const isDM = room.type === 'direct'
                  const roomName = room.name || (isDM ? (room.targetUserName || 'Private Message') : 'Unnamed Group')
                  const isTargetOnline = isDM && room.targetUserId && onlineUsers.has(room.targetUserId)

                  return (
                    <motion.button
                      key={room.id}
                      layout="position"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => onRoomSelect(room.id)}
                      className={cn(
                        'flex w-full items-center gap-4 border-b border-border p-4 transition-all hover:bg-accent/50',
                        activeRoomId === room.id && 'bg-accent',
                      )}
                      >
                        <div className="relative" aria-hidden="true">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {roomName?.[0]?.toUpperCase() || 'C'}
                          </div>
                          {isTargetOnline && (
                            <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950" />
                          )}
                          {room.unreadCount && room.unreadCount > 0 ? (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                              {room.unreadCount}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
                          <div className="flex w-full items-center justify-between">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate pr-2">
                              {roomName}
                            </span>
                          </div>
                          <span className="truncate text-xs text-zinc-500">{room.lastMessage || 'No messages yet'}</span>
                        </div>
                      </motion.button>
                    )
                  })
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
