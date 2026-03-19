import { createDMRoomSchema } from '@chat/validation'
import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validator.middleware'
import type { AppVariables } from '../../types/context'
import { createRoomSchema } from './rooms.schema'
import { roomsService } from './rooms.service'

export const roomsRouter = new Hono<{ Variables: AppVariables }>()

roomsRouter.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const rooms = await roomsService.getUserRooms(userId)
  return c.json({
    success: true,
    data: rooms,
  })
})

roomsRouter.post('/create', authMiddleware, validate('json', createRoomSchema), async (c) => {
  const userId = c.get('userId')
  const data = c.req.valid('json')
  const room = await roomsService.createRoom(userId, data)
  return c.json({
    success: true,
    data: room,
    message: 'Room created successfully',
  })
})
roomsRouter.put('/createDM', authMiddleware, validate('json', createDMRoomSchema), async (c) => {
  const userId = c.get('userId')
  const { targetUserId } = c.req.valid('json')

  const DMRoom = await roomsService.createDMRoom(userId, targetUserId)
  return c.json({
    success: true,
    data: DMRoom,
    message: 'Dm room successfully created',
  })
})
