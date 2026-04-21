export type RoomType = 'direct' | 'group'

export interface Room {
  id: string
  name: string | null
  type: RoomType
  createdAt: string
  updatedAt: string
  memberCount?: number
  lastMessage?: string | null
  lastMessageAt?: string | null
  avatar?: string
  unreadCount?: number
}

export interface Message {
  id: string
  roomId: string
  senderId: string
  senderName?: string
  content: string
  createdAt: string
  updatedAt: string
  replyToId?: string | null
}

export interface User {
  id: string
  email: string
  displayName: string
  avatar?: string | null
  createdAt: string
}
