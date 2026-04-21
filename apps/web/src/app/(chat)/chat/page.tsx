'use client'

import { MessageSquareIcon } from 'lucide-react'

export default function NoRoomSelectedPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-8 bg-zinc-50 dark:bg-black">
      <div className="h-20 w-20 rounded-3xl bg-white dark:bg-zinc-900 shadow-xl flex items-center justify-center mb-6">
        <MessageSquareIcon className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Welcome to Realtime Chat</h2>
      <p className="text-zinc-500 max-w-xs mt-2">
        Select a conversation from the sidebar to start messaging your friends.
      </p>
    </div>
  )
}
