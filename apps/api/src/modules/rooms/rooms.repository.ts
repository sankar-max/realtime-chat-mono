import { db } from '@chat/db'
import { roomMembers, rooms } from '@chat/schema'
import { createId } from '@chat/utils'
import { desc, eq } from 'drizzle-orm'
import type { CreateRoomInput } from './rooms.schema'

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
  async isUserInRoom(userId: string, roomId: string) {
    const member = await db.query.roomMembers.findFirst({
      where: (rm, { eq, and }) => and(eq(rm.userId, userId), eq(rm.roomId, roomId)),
    })

    return !!member
  },
  async getOrCreateDMRoom(userId: string, targetUserId: string, dmKey: string) {
    const existingRoom = await db.query.rooms.findFirst({
      where: eq(rooms.dmKey, dmKey),
    })

    if (existingRoom) return existingRoom

    try {
      return await db.transaction(async (tx) => {
        const roomId = createId()

        const [room] = await tx
          .insert(rooms)
          .values({
            id: roomId,
            name: null,
            type: 'direct',
            createdBy: userId,
            dmKey,
          })
          .returning()

        await tx.insert(roomMembers).values([
          {
            id: createId(),
            userId,
            roomId: room.id,
            role: 'admin',
            joinedAt: new Date(),
          },
          {
            id: createId(),
            userId: targetUserId,
            roomId: room.id,
            role: 'member',
            joinedAt: new Date(),
          },
        ])

        return room
      })
    } catch (err) {
      const room = await db.query.rooms.findFirst({
        where: eq(rooms.dmKey, dmKey),
      })

      if (!room) {
        throw err
      }

      return room
    }
  },

  async createRoom(userId: string, data: CreateRoomInput) {
    return await db.transaction(async (tx) => {
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
