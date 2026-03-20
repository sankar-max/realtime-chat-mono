import { db } from '@chat/db'
import { messages } from '@chat/schema'
import { createId } from '@chat/utils'
import { eq } from 'drizzle-orm'

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
  async isUserInRoom(userId: string, roomId: string) {
    const member = await db.query.roomMembers.findFirst({
      where: (rm, { eq, and }) => and(eq(rm.userId, userId), eq(rm.roomId, roomId)),
    })

    return !!member
  },
  async getMessagesByRoom(roomId: string) {
    return db.query.messages.findMany({
      where: (m, { eq, and }) => and(eq(m.roomId, roomId), eq(m.isDeletedForEveryone, false)),
      orderBy: (m, { desc }) => desc(m.createdAt),
    })
  },

  async getMessageById(id: string) {
    return db.query.messages.findFirst({
      where: eq(messages.id, id),
    })
  },
}
