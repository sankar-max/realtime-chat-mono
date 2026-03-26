import { roomsService } from '@chat/module'
import { createDMRoomSchema } from '@chat/validation'
import { Hono } from 'hono'
import { sendSuccess } from '../../lib/response'
import { authMiddleware } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validator.middleware'
import type { AppVariables } from '../../types/context'
import { createRoomSchema } from './rooms.schema'

export const roomsRouter = new Hono<{ Variables: AppVariables }>()

roomsRouter.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const rooms = await roomsService.getUserRooms(userId)
  return sendSuccess(c, rooms)
})

roomsRouter.post('/create', authMiddleware, validate('json', createRoomSchema), async (c) => {
  const userId = c.get('userId')
  const data = c.req.valid('json')
  const room = await roomsService.createRoom(userId, data)
  return sendSuccess(c, room, 'Room created successfully')
})

roomsRouter.put('/dm', authMiddleware, validate('json', createDMRoomSchema), async (c) => {
  const userId = c.get('userId')
  const { targetUserId } = c.req.valid('json')

  const DMRoom = await roomsService.createDMRoom(userId, targetUserId)
  return sendSuccess(c, DMRoom, 'DM room fetched or created')
})
