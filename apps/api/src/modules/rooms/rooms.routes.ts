import { type Context, Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth.middleware'
import { roomsService } from './rooms.service'

export const roomsRouter = new Hono()

roomsRouter.get('/', authMiddleware, async (c: Context) => {
  const userId = c.get('userId')
  const rooms = await roomsService.getUserRooms(userId)
  return c.json({
    success: true,
    data: rooms,
  })
})

roomsRouter.post('/create', authMiddleware, async (c: Context) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const room = await roomsService.createRoom(userId, body)
  return c.json({
    success: true,
    data: room,
    message: 'Room created successfully',
  })
})
