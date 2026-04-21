'use client'

import { SendIcon } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MessageInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSend(content)
      setContent('')
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-zinc-950 border-t dark:border-zinc-800">
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto" aria-label="Send message">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          disabled={disabled}
          aria-label="Message content"
          className="flex-1 rounded-full px-6 h-12 bg-zinc-100 dark:bg-zinc-900 border-none focus-visible:ring-primary"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || disabled}
          aria-label="Send message button"
          className="h-12 w-12 rounded-full shadow-lg shadow-primary/20 transition-transform active:scale-95"
        >
          <SendIcon className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}
