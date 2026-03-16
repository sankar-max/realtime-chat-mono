import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth.middleware'
import { authController } from './auth.controller'

export const authRouter = new Hono()

authRouter.post('/register', authController.register)

authRouter.post('/login', authController.login)

authRouter.get('/me', authMiddleware, authController.getMe)
