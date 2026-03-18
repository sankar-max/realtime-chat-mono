import { db } from '@chat/db'
import { roomMembers, rooms } from '@chat/schema'
import { createId } from '@chat/utils'
import { desc, eq } from 'drizzle-orm'

export const roomsRepository = {
  async getUserRooms(userId: string) {
    return db
      .select({
        id: rooms.id,
        name: rooms.name,
        type: rooms.type,
        createdAt: rooms.createdAt,
        updatedAt: rooms.updatedAt,
      })
      .from(rooms)
      .innerJoin(roomMembers, eq(rooms.id, roomMembers.roomId))
      .where(eq(roomMembers.userId, userId))
      .orderBy(desc(rooms.updatedAt))
  },

  async createRoom(userId: string, data: { name: string; type: string }) {
    return db.transaction(async (tx) => {
      const roomId = createId()

      const [room] = await tx
        .insert(rooms)
        .values({
          id: roomId,
          name: data.name,
          type: data.type as 'direct' | 'group',
          createdBy: userId,
        })
        .returning()

      await tx.insert(roomMembers).values({
        id: createId(),
        userId,
        roomId: room.id,
        role: 'admin',
        joinedAt: new Date(),
      })

      return room
    })
  },
}
