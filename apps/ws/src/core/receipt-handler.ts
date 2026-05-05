import { messageRepository, roomRepository } from '@chat/core'
import type { ServerMessage } from '@chat/ws-types'
import { connectionManager } from '../connection-manager'

/**
 * Upsert a receipt for a user+message.
 * Uses ON CONFLICT to only upgrade status (delivered → read), never downgrade.
 */
export async function upsertReceipt(userId: string, messageId: string, status: 'delivered' | 'read'): Promise<void> {
  await messageRepository.upsertReceipt(userId, messageId, status)
}

/**
 * Fetch all user IDs that are members of a room.
 */
export async function getRoomMemberIds(roomId: string): Promise<string[]> {
  return roomRepository.getRoomMemberIds(roomId)
}

/**
 * Broadcast RECEIPT_UPDATE to all room members who are currently online.
 */
export function broadcastReceiptUpdate(
  memberIds: string[],
  payload: {
    roomId: string
    messageId: string
    userId: string
    status: 'delivered' | 'read'
    updatedAt: string
  },
): void {
  const message: ServerMessage = {
    type: 'RECEIPT_UPDATE',
    payload,
  }
  connectionManager.sendToRoom(memberIds, message)
}
