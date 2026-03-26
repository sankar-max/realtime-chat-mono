import { db } from '@chat/db'
import { messages } from '@chat/schema'
import { createId } from '@chat/utils'
import { eq } from 'drizzle-orm'
import type { MessageCursor } from './messages.cursor'

export const messagesRepository = {
  async createMessage(input: { roomId: string; senderId: string; content: string; replyToId?: string }) {
    const [message] = await db
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
  },
  async getMessagesByRoom(roomId: string) {
    return db.query.messages.findMany({
      where: (m, { eq, and }) => and(eq(m.roomId, roomId), eq(m.isDeletedForEveryone, false)),
      orderBy: (m, { desc }) => desc(m.createdAt),
    })
  },
  async getMessagesByRoomPaginated(input: { roomId: string; cursor?: MessageCursor; limit: number }) {
    const { roomId, cursor, limit } = input

    return db.query.messages.findMany({
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
  },
  async getMessageById(id: string) {
    return db.query.messages.findFirst({
      where: eq(messages.id, id),
    })
  },
}
