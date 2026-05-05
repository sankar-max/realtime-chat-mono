import { getConnInfo } from '@hono/node-server/conninfo'
import type { Context } from 'hono'
import { Hono } from 'hono'
import { sendSuccess } from '../../lib/response'
import { authMiddleware } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validator.middleware'
import { loginSchema, refreshTokenSchema, registerSchema } from './auth.schema'
import { authService } from '@chat/core'

export const authRouter = new Hono()

authRouter.post('/register', validate('json', registerSchema), async (c) => {
  const data = c.req.valid('json')
  const user = await authService.register(data)
  return sendSuccess(c, user, undefined, 201)
})

authRouter.post('/login', validate('json', loginSchema), async (c) => {
  const data = c.req.valid('json')
  const userAgent = c.req.header('user-agent')
  const info = getConnInfo(c)
  const deviceIp = info.remote.address

  const { deviceName, ...credentials } = data

  const result = await authService.login(credentials, {
    deviceIp,
    userAgent,
    deviceName,
  })

  return sendSuccess(c, result)
})

authRouter.post('/refresh', validate('json', refreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid('json')
  const result = await authService.refresh(refreshToken)
  return sendSuccess(c, result)
})

authRouter.post('/logout', authMiddleware, async (c: Context) => {
  const sessionId = c.get('sessionId')
  await authService.logout(sessionId)
  return sendSuccess(c, undefined, 'Logged out successfully')
})

authRouter.get('/me', authMiddleware, async (c: Context) => {
  const userId = c.get('userId')
  const user = await authService.getMe(userId)
  return sendSuccess(c, user)
})
