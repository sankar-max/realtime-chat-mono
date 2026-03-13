import { Hono } from 'hono'

import { authController } from './auth.controller'

export const authRouter = new Hono()

authRouter.post('/register', authController.register)

authRouter.post('/login', authController.login)
