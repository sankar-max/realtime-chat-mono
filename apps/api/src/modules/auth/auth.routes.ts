import { zValidator } from '@hono/zod-validator'
import type { Context } from 'hono'
import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth.middleware'
import { loginSchema, refreshTokenSchema, registerSchema } from './auth.schema'
import { authService } from './auth.service'

export const authRouter = new Hono()

authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const data = c.req.valid('json')
  const user = await authService.register(data)

  return c.json(
    {
      success: true,
      data: user,
    },
    201,
  )
})

authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const data = c.req.valid('json')
  const result = await authService.login(data)

  return c.json({
    success: true,
    data: result,
  })
})

authRouter.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid('json')
  const result = await authService.refresh(refreshToken)
  return c.json({
    success: true,
    data: result,
  })
})

authRouter.post('/logout', authMiddleware, async (c: Context) => {
  const sessionId = c.get('sessionId')
  await authService.logout(sessionId)
  return c.json({
    success: true,
    message: 'Logged out successfully',
  })
})

authRouter.get('/me', authMiddleware, async (c: Context) => {
  const userId = c.get('userId')
  const user = await authService.getMe(userId)
  return c.json({
    success: true,
    data: user,
  })
})
