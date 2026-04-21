'use client'

import type { Message } from '@chat/types'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { cn } from '@/lib/utils'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const { user } = useAuth()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-6 space-y-4"
      role="log"
      aria-live="polite"
      aria-label="Message history"
    >
      {messages.map((message, index) => {
        const isMe = message.senderId === user?.id
        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn('flex w-full flex-col', isMe ? 'items-end' : 'items-start')}
          >
            <div
              className={cn(
                'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                isMe
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none border dark:border-zinc-700',
              )}
            >
              <div className="flex flex-col gap-1">
                {!isMe && (
                  <span className="text-[10px] font-bold uppercase opacity-50 tracking-wider">
                    {message.senderName || 'Unknown User'}
                  </span>
                )}
                <p className="leading-relaxed">{message.content}</p>
                <span className={cn('text-[9px] mt-1 self-end opacity-70', isMe ? 'text-white/80' : 'text-zinc-500')}>
                  {format(new Date(message.createdAt), 'HH:mm')}
                </span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
