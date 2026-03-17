import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { authMiddleware } from '../../middleware/auth.middleware'

export const roomsRouter = new Hono()

// Placeholder for room creation to demonstrate the pattern
roomsRouter.post(
  '/',
  authMiddleware,
  zValidator(
    'json',
    z.object({
      name: z.string().min(3).max(100),
      description: z.string().optional(),
    }),
  ),
  async (c) => {
    // const data = c.req.valid('json')
    // const result = await roomsService.createRoom(data)
    return c.json({
      success: true,
      message: 'Room endpoint placeholder - Follow this pattern for future development',
    })
  },
)
