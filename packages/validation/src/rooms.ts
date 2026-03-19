import { rooms } from '@chat/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const dbRoomSelectSchema = createSelectSchema(rooms)
export const dbRoomInsertSchema = createInsertSchema(rooms)

export type Room = z.infer<typeof dbRoomSelectSchema>
export type InsertRoom = z.infer<typeof dbRoomInsertSchema>

export const roomTypeEnum = z.enum(rooms.type.enumValues)
export const createRoomSchema = z.object({
  name: z.string().trim().min(1, 'Room name is required').max(100, 'Room name must be less than 100 characters'),

  type: roomTypeEnum,
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>

export const createDMRoomSchema = z.object({
  targetUserId: z.string().min(1, 'Target user id is required'),
})

export type CreateDMRoomInput = z.infer<typeof createDMRoomSchema>
