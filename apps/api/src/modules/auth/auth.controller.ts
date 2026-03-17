import type { Context } from 'hono'
import { NotFoundError } from '../../lib/errors'
import { authService } from './auth.service'

export const authController = {
  async register(c: Context) {
    const data = c.req.valid('json' as never)
    const user = await authService.register(data)

    return c.json(
      {
        success: true,
        data: user,
      },
      201,
    )
  },

  async login(c: Context) {
    const data = c.req.valid('json' as never)
    const result = await authService.login(data)

    return c.json({
      success: true,
      data: result,
    })
  },

  async refresh(c: Context) {
    const { refreshToken } = c.req.valid('json' as never)
    const result = await authService.refresh(refreshToken)

    return c.json({
      success: true,
      data: result,
    })
  },

  async logout(c: Context) {
    const sessionId = c.get('sessionId')
    await authService.logout(sessionId)

    return c.json({
      success: true,
      message: 'Logged out successfully',
    })
  },

  async getMe(c: Context) {
    const userId = c.get('userId')
    const user = await authService.getMe(userId)

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return c.json({
      success: true,
      data: user,
    })
  },
}
