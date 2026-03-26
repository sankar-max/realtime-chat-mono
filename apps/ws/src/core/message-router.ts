import { env } from '@chat/config'
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
    const { roomId, content } = payload

    // 🔥 Call API/service (NOT direct send)
    await fetch(`${env.API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${/* token */ ''}`,
      },
      body: JSON.stringify({
        roomId,
        content,
      }),
    })
  }
}
export const messageRouter = new MessageRouter(connectionManager)
