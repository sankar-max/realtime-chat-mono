import { messages, roomMembers, rooms, users } from '@chat/schema'
import { createId } from '@chat/utils'
import { desc, eq, sql } from 'drizzle-orm'
import type { db } from '@chat/db'
import type { CreateRoomInput } from '@chat/validation'

export class RoomRepository {
  constructor(private readonly database: typeof db) {}

  async getUserRooms(userId: string) {
    return this.database
      .select({
        id: rooms.id,
        name: rooms.name,
        type: rooms.type,
        createdAt: rooms.createdAt,
        updatedAt: rooms.updatedAt,
        memberCount:
          sql<number>`(SELECT count(*) FROM ${roomMembers} WHERE ${roomMembers.roomId} = ${rooms.id})`.mapWith(Number),
        lastMessage: sql<
          string | null
        >`(SELECT content FROM ${messages} WHERE ${messages.roomId} = ${rooms.id} ORDER BY ${messages.createdAt} DESC LIMIT 1)`,
        lastMessageAt: sql<Date | null>`(SELECT created_at FROM ${messages} WHERE ${messages.roomId} = ${rooms.id} ORDER BY ${messages.createdAt} DESC LIMIT 1)`,
        targetUserId: sql<string | null>`(SELECT ${roomMembers.userId} FROM ${roomMembers} WHERE ${roomMembers.roomId} = ${rooms.id} AND ${roomMembers.userId} != ${userId} LIMIT 1)`,
        targetUserName: sql<string | null>`(SELECT ${users.displayName} FROM ${users} JOIN ${roomMembers} ON ${users.id} = ${roomMembers.userId} WHERE ${roomMembers.roomId} = ${rooms.id} AND ${roomMembers.userId} != ${userId} LIMIT 1)`,
      })
      .from(rooms)
      .innerJoin(roomMembers, eq(rooms.id, roomMembers.roomId))
      .where(eq(roomMembers.userId, userId))
      .orderBy(desc(rooms.updatedAt))
  }

  async isUserInRoom(userId: string, roomId: string) {
    const member = await this.database.query.roomMembers.findFirst({
      where: (rm, { eq, and }) => and(eq(rm.userId, userId), eq(rm.roomId, roomId)),
    })

    return !!member
  }

  async getOrCreateDMRoom(userId: string, targetUserId: string, dmKey: string) {
    const existingRoom = await this.database.query.rooms.findFirst({
      where: eq(rooms.dmKey, dmKey),
    })

    if (existingRoom) return existingRoom

    try {
      return await this.database.transaction(async (tx) => {
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
      const room = await this.database.query.rooms.findFirst({
        where: eq(rooms.dmKey, dmKey),
      })

      if (!room) {
        throw err
      }

      return room
    }
  }

  async createRoom(userId: string, data: CreateRoomInput) {
    return await this.database.transaction(async (tx) => {
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

      const membersToInsert: Array<{
        id: string
        userId: string
        roomId: string
        role: 'admin' | 'member'
        joinedAt: Date
      }> = [
        {
          id: createId(),
          userId,
          roomId: room.id,
          role: 'admin',
          joinedAt: new Date(),
        },
      ]

      if (data.memberIds && data.memberIds.length > 0) {
        // Exclude the creator if they were accidentally included in the list
        const uniqueOtherMembers = Array.from(new Set(data.memberIds)).filter(id => id !== userId)
        
        for (const memberId of uniqueOtherMembers) {
          membersToInsert.push({
            id: createId(),
            userId: memberId,
            roomId: room.id,
            role: 'member' as const,
            joinedAt: new Date(),
          })
        }
      }

      await tx.insert(roomMembers).values(membersToInsert)

      return room
    })
  }

  async getRoomMemberIds(roomId: string): Promise<string[]> {
    const members = await this.database.query.roomMembers.findMany({
      where: (rm, { eq }) => eq(rm.roomId, roomId),
      columns: { userId: true },
    })
    return members.map((m) => m.userId)
  }
}
