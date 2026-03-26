import { messagesService } from '@chat/module'
import type { ClientMessage, ServerMessage } from '@chat/ws-types'
import { ClientMessageSchema } from '@chat/ws-types'
import { connectionManager } from '../connection-manager'

interface IConnectionManager {
  sendToUser(userId: string, message: ServerMessage): void
}
export class MessageRouter {
  constructor(private connectionManager: IConnectionManager) {}

  handle(userId: string, raw: string) {
    let message: ClientMessage

    try {
      const parsed = JSON.parse(raw)
      message = ClientMessageSchema.parse(parsed)
    } catch {
      return
    }
    console.log('📨 parsing message:', raw)
    switch (message.type) {
      case 'PING':
        console.log('🏓 PING HANDLER HIT for', userId)
        this.connectionManager.sendToUser(userId, {
          type: 'PONG',
        })
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
      await messagesService.sendMessage(userId, {
        roomId,
        content,
        replyToId,
      })
    } catch (error) {
      console.error('❌ Failed to save message from WS:', error)
      this.connectionManager.sendToUser(userId, {
        type: 'ERROR',
        payload: { message: 'Failed to send message' },
      })
    }
  }
}
export const messageRouter = new MessageRouter(connectionManager)
