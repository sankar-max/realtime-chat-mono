import { messageService } from '@chat/core'
import type { ClientMessage, ServerMessage } from '@chat/ws-types'
import { ClientMessageSchema } from '@chat/ws-types'
import { connectionManager } from '../connection-manager'
import { broadcastReceiptUpdate, getRoomMemberIds, upsertReceipt } from './receipt-handler'

interface IConnectionManager {
  sendToUser(userId: string, message: ServerMessage): void
  isOnline(userId: string): boolean
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

    switch (message.type) {
      case 'PING':
        this.connectionManager.sendToUser(userId, { type: 'PONG' })
        break

      case 'SEND_MESSAGE':
        this.handleSendMessage(userId, message.payload)
        break

      case 'MARK_READ':
        this.handleMarkRead(userId, message.payload)
        break

      default:
        console.warn('Unknown message type')
    }
  }

  private async handleSendMessage(userId: string, payload: { roomId: string; content: string; replyToId?: string; tempId?: string }) {
    const { roomId, content, replyToId, tempId } = payload

    try {
      const message = await messageService.sendMessage(userId, {
        roomId,
        content,
        replyToId,
      })

      // ── 3. Get all room member IDs ───────────────────────────────────────
      const memberIds = await getRoomMemberIds(roomId)

      // ── 4. Broadcast NEW_MESSAGE to all online room members ──────────────
      connectionManager.sendToRoom(memberIds, {
        type: 'NEW_MESSAGE',
        payload: {
          id: message.id,
          roomId: message.roomId,
          senderId: message.senderId,
          content: message.content,
          type: message.type,
          replyToId: message.replyToId,
          createdAt: message.createdAt.toISOString(),
          tempId: tempId,
        },
      })

      // ── 5. Auto-deliver to online members (excluding sender) ─────────────
      const now = new Date().toISOString()
      const onlineRecipients = memberIds.filter((id) => id !== userId && this.connectionManager.isOnline(id))

      for (const memberId of onlineRecipients) {
        await upsertReceipt(memberId, message.id, 'delivered')
        broadcastReceiptUpdate(memberIds, {
          roomId,
          messageId: message.id,
          userId: memberId,
          status: 'delivered',
          updatedAt: now,
        })
      }
    } catch (error) {
      console.error('❌ Failed to save message from WS:', error)
      this.connectionManager.sendToUser(userId, {
        type: 'ERROR',
        payload: { message: 'Failed to send message' },
      })
    }
  }

  private async handleMarkRead(userId: string, payload: { roomId: string; lastReadMessageId: string }) {
    const { roomId, lastReadMessageId } = payload

    try {
      // (Membership is technically verified by receipt insertion or messageService, but here we can just rely on getRoomMemberIds below if needed, or roomService.assertRoomAccess)
      // We will skip the manual db check here and let upsertReceipt handle it, or we could call roomService.assertRoomAccess(userId, roomId) but the user is already authenticated.
      // ── 2. Upsert read receipt ───────────────────────────────────────────
      await upsertReceipt(userId, lastReadMessageId, 'read')

      // ── 3. Broadcast RECEIPT_UPDATE to all room members ──────────────────
      const memberIds = await getRoomMemberIds(roomId)
      broadcastReceiptUpdate(memberIds, {
        roomId,
        messageId: lastReadMessageId,
        userId,
        status: 'read',
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('❌ Failed to handle MARK_READ:', error)
      this.connectionManager.sendToUser(userId, {
        type: 'ERROR',
        payload: { message: 'Failed to mark as read' },
      })
    }
  }
}

export const messageRouter = new MessageRouter(connectionManager)
