import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth.middleware'
import { authController } from './auth.controller'
import { loginSchema, refreshTokenSchema, registerSchema } from './auth.schema'

export const authRouter = new Hono()

authRouter.post('/register', zValidator('json', registerSchema), authController.register)

authRouter.post('/login', zValidator('json', loginSchema), authController.login)

authRouter.post('/refresh', zValidator('json', refreshTokenSchema), authController.refresh)

authRouter.post('/logout', authMiddleware, authController.logout)

authRouter.get('/me', authMiddleware, authController.getMe)
