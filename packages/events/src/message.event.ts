export type MessageCreatedEvent = {
  message: {
    id: string
    roomId: string
    senderId: string
    content: string | null
    createdAt: Date
  }
}

type Listener = (event: MessageCreatedEvent) => void | Promise<void>

const listeners = new Set<Listener>()

export function onMessageCreated(listener: Listener) {
  listeners.add(listener)

  // optional cleanup support
  return () => listeners.delete(listener)
}

export function emitMessageCreated(event: MessageCreatedEvent) {
  for (const listener of listeners) {
    listener(event)
  }
}
