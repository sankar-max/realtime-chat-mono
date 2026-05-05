import { z } from 'zod'

export const roomTypeEnum = z.enum(['direct', 'group'])

export const dbRoomSelectSchema = z.object({
  id: z.string().max(255),
  name: z.string().max(255).nullable(),
  dmKey: z.string().max(255).nullable(),
  type: roomTypeEnum,
  createdAt: z.date(),
  createdBy: z.string().max(255),
  updatedAt: z.date(),
})

export const dbRoomInsertSchema = z.object({
  id: z.string().max(255),
  name: z.string().max(255).nullable().optional(),
  dmKey: z.string().max(255).nullable().optional(),
  type: roomTypeEnum,
  createdAt: z.date().optional(),
  createdBy: z.string().max(255),
  updatedAt: z.date().optional(),
})

export type Room = z.infer<typeof dbRoomSelectSchema>
export type InsertRoom = z.infer<typeof dbRoomInsertSchema>

export const createRoomSchema = z.object({
  name: z.string().trim().min(1, 'Room name is required').max(100, 'Room name must be less than 100 characters'),
  type: roomTypeEnum,
  memberIds: z.array(z.string()).optional(),
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>

export const createDMRoomSchema = z.object({
  targetUserId: z.string().min(1, 'Target user id is required'),
})

export type CreateDMRoomInput = z.infer<typeof createDMRoomSchema>
