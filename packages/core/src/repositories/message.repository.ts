import { messageReceipts, messages } from '@chat/schema'
import { createId } from '@chat/utils'
import { desc, eq } from 'drizzle-orm'
import type { db } from '@chat/db'
import type { MessageCursor } from '../utils/cursor'

export class MessageRepository {
  constructor(private readonly database: typeof db) {}

  async createMessage(input: { roomId: string; senderId: string; content: string; replyToId?: string }) {
    const [message] = await this.database
      .insert(messages)
      .values({
        id: createId(),
        roomId: input.roomId,
        senderId: input.senderId,
        content: input.content,
        type: 'text',
        replyToId: input.replyToId ?? null,
      })
      .returning()

    return message
  }

  async getMessagesByRoom(roomId: string) {
    return this.database.query.messages.findMany({
      where: (m, { eq, and }) => and(eq(m.roomId, roomId), eq(m.isDeletedForEveryone, false)),
      orderBy: (m, { desc }) => desc(m.createdAt),
    })
  }

  async getMessagesByRoomPaginated(input: { roomId: string; cursor?: MessageCursor; limit: number }) {
    const { roomId, cursor, limit } = input

    return this.database.query.messages.findMany({
      where: (m, { eq, and, or, lt }) =>
        and(
          eq(m.roomId, roomId),
          eq(m.isDeletedForEveryone, false),

          cursor
            ? or(
                lt(m.createdAt, new Date(cursor.createdAt)),

                and(eq(m.createdAt, new Date(cursor.createdAt)), lt(m.id, cursor.id)),
              )
            : undefined,
        ),

      orderBy: (m, { desc }) => [desc(m.createdAt), desc(m.id)],

      limit,
    })
  }

  async getMessageById(id: string) {
    return this.database.query.messages.findFirst({
      where: eq(messages.id, id),
    })
  }

  async getRoomReceipts(roomId: string) {
    return this.database
      .select({
        messageId: messageReceipts.messageId,
        userId: messageReceipts.userId,
        status: messageReceipts.status,
        updatedAt: messageReceipts.updatedAt,
      })
      .from(messageReceipts)
      .innerJoin(messages, eq(messageReceipts.messageId, messages.id))
      .where(eq(messages.roomId, roomId))
      .orderBy(desc(messageReceipts.updatedAt))
  }

  async upsertReceipt(userId: string, messageId: string, status: 'delivered' | 'read'): Promise<void> {
    await this.database
      .insert(messageReceipts)
      .values({
        messageId,
        userId,
        status,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [messageReceipts.messageId, messageReceipts.userId],
        set: {
          status,
          updatedAt: new Date(),
        },
      })
  }
}
