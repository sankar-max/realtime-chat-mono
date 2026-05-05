import { Hono } from 'hono'
import { sendSuccess } from '../../lib/response'
import { authMiddleware } from '../../middleware/auth.middleware'
import type { AppVariables } from '../../types/context'
import { authService } from '@chat/core'

export const usersRouter = new Hono<{ Variables: AppVariables }>()

usersRouter.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const users = await authService.getAllUsers(userId)
  return sendSuccess(c, users)
})
