import { db } from '@chat/db'
import { emitMessageCreated } from '@chat/events'
import { messages } from '@chat/schema'
import { createId } from '@chat/utils'
import { connectionManager } from '../connection-manager'

type IncomingMessage = {
  type: 'PING' | 'SEND_MESSAGE'
  payload: any
}

export class MessageRouter {
  constructor(private connectionManager: any) {}

  handle(userId: string, raw: string) {
    let message: IncomingMessage

    try {
      message = JSON.parse(raw)
    } catch {
      return
    }
    console.log('📨 parsing message:', raw)
    switch (message.type) {
      case 'PING':
        console.log('🏓 PING HANDLER HIT for', userId)
        this.connectionManager.sendToUser(
          userId,
          JSON.stringify({
            type: 'PONG',
          }),
        )
        break

      case 'SEND_MESSAGE':
        this.handleSendMessage(userId, message.payload)
        break

      default:
        console.warn('Unknown message type')
    }
  }

  private async handleSendMessage(userId: string, payload: any) {
    const { roomId, content, replyToId } = payload

    try {
      const [message] = await db
        .insert(messages)
        .values({
          id: createId(),
          roomId,
          senderId: userId,
          content,
          type: 'text',
          replyToId: replyToId ?? null,
        })
        .returning()

      emitMessageCreated({ message })
    } catch (error) {
      console.error('❌ Failed to save message from WS:', error)
      this.connectionManager.sendToUser(
        userId,
        JSON.stringify({
          type: 'ERROR',
          payload: { message: 'Failed to send message' },
        }),
      )
    }
  }
}
export const messageRouter = new MessageRouter(connectionManager)
