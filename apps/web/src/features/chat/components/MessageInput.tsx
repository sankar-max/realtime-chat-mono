'use client'

import { SendIcon, WifiOff } from 'lucide-react'
import type React from 'react'
import { useCallback, useRef, useState } from 'react'
import type { WsStatus } from '@/lib/ws-client'
import { cn } from '@/lib/utils'

const MAX_CHARS = 4000

interface MessageInputProps {
  onSend: (content: string) => void
  disabled?: boolean
  wsStatus?: WsStatus
}

export function MessageInput({ onSend, disabled, wsStatus }: MessageInputProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isDisconnected = wsStatus && wsStatus !== 'connected'
  const isEffectivelyDisabled = disabled || isDisconnected

  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > MAX_CHARS) return
    setContent(e.target.value)
    resizeTextarea()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const trimmed = content.trim()
    if (!trimmed || isEffectivelyDisabled) return
    onSend(trimmed)
    setContent('')
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const charsRemaining = MAX_CHARS - content.length
  const isNearLimit = charsRemaining < 200

  return (
    <div className="px-4 pb-4 pt-2 bg-background border-t border-border">
      {/* WS disconnected banner */}
      {isDisconnected && (
        <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 text-xs font-medium">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          {wsStatus === 'connecting' ? 'Connecting to chat server…' : 'Disconnected. Messages are paused.'}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className="flex items-end gap-2 max-w-4xl mx-auto"
        aria-label="Send message"
      >
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            id="message-input"
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isDisconnected ? 'Reconnecting…' : 'Message… (Enter to send, Shift+Enter for newline)'}
            disabled={!!isEffectivelyDisabled}
            rows={1}
            aria-label="Message content"
            aria-disabled={!!isEffectivelyDisabled}
            className={cn(
              'w-full resize-none rounded-2xl px-5 py-3.5 text-sm leading-relaxed',
              'bg-muted text-foreground',
              'border border-transparent focus:outline-none focus:border-ring/50 focus:ring-2 focus:ring-ring/20',
              'transition-all duration-150 placeholder:text-muted-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'min-h-[48px] max-h-[160px]',
            )}
          />
          {isNearLimit && content.length > 0 && (
            <span
              className={cn(
                'absolute bottom-2.5 right-3 text-[10px] tabular-nums',
                charsRemaining < 50 ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {charsRemaining}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!content.trim() || !!isEffectivelyDisabled}
          aria-label="Send message"
          className={cn(
            'h-12 w-12 shrink-0 rounded-full flex items-center justify-center',
            'bg-primary text-primary-foreground shadow-lg shadow-primary/25',
            'transition-all duration-150 active:scale-95 hover:shadow-primary/40 hover:shadow-xl',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100',
          )}
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
}
