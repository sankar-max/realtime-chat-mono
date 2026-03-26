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

  private handleSendMessage(userId: string, payload: any) {
    const { toUserId, content } = payload

    // 🔥 For now: direct send (DM)
    this.connectionManager.sendToUser(
      toUserId,
      JSON.stringify({
        type: 'NEW_MESSAGE',
        payload: {
          from: userId,
          content,
        },
      }),
    )
  }
}
export const messageRouter = new MessageRouter(connectionManager)
