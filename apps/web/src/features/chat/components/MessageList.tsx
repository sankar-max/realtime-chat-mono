'use client'

import type { Message } from '@chat/types'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCheck, Clock, RefreshCw, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import type { OptimisticMessage } from '@/store/messages/messagesSlice'
import { cn } from '@/lib/utils'

type AnyMessage = Message | OptimisticMessage

function isOptimistic(m: AnyMessage): m is OptimisticMessage {
  return 'status' in m
}

interface MessageListProps {
  messages: AnyMessage[]
  onRetry?: (tempId: string) => void
  onDismiss?: (tempId: string) => void
}

function MessageStatusIcon({ status }: { status: 'sending' | 'sent' | 'failed' }) {
  if (status === 'sending') {
    return <Clock className="h-3 w-3 opacity-60 animate-pulse" />
  }
  if (status === 'sent') {
    return <CheckCheck className="h-3 w-3 opacity-60" />
  }
  return <AlertCircle className="h-3 w-3 text-red-400" />
}

export function MessageList({ messages, onRetry, onDismiss }: MessageListProps) {
  const user = useAuthStore((s) => s.user)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
        <div className="text-5xl">💬</div>
        <p className="text-sm font-medium">No messages yet. Say hello!</p>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scroll-smooth"
      role="log"
      aria-live="polite"
      aria-label="Message history"
    >
      <AnimatePresence initial={false}>
        {messages.map((message, idx) => {
          const isMe = message.senderId === user?.id
          const opt = isOptimistic(message) ? message : null
          const isSending = opt?.status === 'sending'
          const isFailed = opt?.status === 'failed'
          const tempId = opt?.tempId ?? message.id

          // Group consecutive messages from the same sender
          const prev = messages[idx - 1]
          const isSameAsPrev = prev && prev.senderId === message.senderId
          const next = messages[idx + 1]
          const isSameAsNext = next && next.senderId === message.senderId

          return (
            <motion.div
              key={tempId}
              layout
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: isSending ? 0.75 : 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={cn(
                'flex w-full',
                isMe ? 'justify-end' : 'justify-start',
                isSameAsPrev ? 'mt-0.5' : 'mt-4',
              )}
            >
              {/* Avatar for other user */}
              {!isMe && (
                <div
                  className={cn(
                    'mr-2 h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold self-end',
                    'bg-primary text-primary-foreground',
                    isSameAsNext ? 'invisible' : 'visible',
                  )}
                  title={message.senderName || 'User'}
                >
                  {(message.senderName?.[0] ?? message.senderId?.[0] ?? 'U').toUpperCase()}
                </div>
              )}

              <div className={cn('flex flex-col max-w-[50%] md:max-w-md', isMe ? 'items-end' : 'items-start')}>
                {!isMe && !isSameAsPrev && message.senderName && (
                  <span className="text-[11px] text-muted-foreground font-medium mb-1 ml-1">
                    {message.senderName}
                  </span>
                )}
                {/* Bubble */}
                <div
                  className={cn(
                    'relative px-4 py-2.5 text-sm shadow-sm break-words',
                    // Shape
                    'rounded-2xl',
                    isMe
                      ? cn(
                          'bg-primary text-primary-foreground',
                          isSameAsPrev ? 'rounded-tr-2xl' : 'rounded-tr-sm',
                          isSameAsNext ? 'rounded-br-2xl' : 'rounded-br-2xl',
                        )
                      : cn(
                          'bg-card text-card-foreground border border-border',
                          isSameAsPrev ? 'rounded-tl-2xl' : 'rounded-tl-sm',
                        ),
                    isFailed && 'ring-2 ring-destructive/60',
                  )}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>

                  <div
                    className={cn(
                      'flex items-center gap-1 mt-1',
                      isMe ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[9px] font-medium',
                        isMe ? 'text-primary-foreground/70' : 'text-muted-foreground',
                      )}
                    >
                      {format(new Date(message.createdAt), 'HH:mm')}
                    </span>
                    {isMe && opt && (
                      <MessageStatusIcon status={opt.status} />
                    )}
                  </div>
                </div>

                {/* Failed message actions */}
                {isFailed && isMe && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-1.5"
                  >
                    <span className="text-[10px] text-destructive font-medium">Failed to send</span>
                    {onRetry && (
                      <button
                        type="button"
                        onClick={() => onRetry(tempId)}
                        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                        aria-label="Retry sending message"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </button>
                    )}
                    {onDismiss && (
                      <button
                        type="button"
                        onClick={() => onDismiss(tempId)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Dismiss failed message"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  )
}
