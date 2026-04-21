import { db } from '@chat/db'
import { messageReceipts } from '@chat/schema'
import type { ServerMessage } from '@chat/ws-types'
import { connectionManager } from '../connection-manager'

/**
 * Upsert a receipt for a user+message.
 * Uses ON CONFLICT to only upgrade status (delivered → read), never downgrade.
 */
export async function upsertReceipt(userId: string, messageId: string, status: 'delivered' | 'read'): Promise<void> {
  await db
    .insert(messageReceipts)
    .values({
      messageId,
      userId,
      status,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [messageReceipts.messageId, messageReceipts.userId],
      // Only update if upgrading: delivered → read. Never downgrade read → delivered.
      set: {
        status,
        updatedAt: new Date(),
      },
    })
}

/**
 * Fetch all user IDs that are members of a room.
 */
export async function getRoomMemberIds(roomId: string): Promise<string[]> {
  const members = await db.query.roomMembers.findMany({
    where: (rm, { eq }) => eq(rm.roomId, roomId),
    columns: { userId: true },
  })
  return members.map((m) => m.userId)
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
