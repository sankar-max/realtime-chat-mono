import 'dotenv/config'
import { env } from '@chat/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { errorHandler } from './middleware/error.middleware'
import { requestIdMiddleware } from './middleware/requestId.middleware'
import { authRouter } from './modules/auth/auth.routes'
import { messagesRouter } from './modules/messages/messages.routes'
import { roomsRouter } from './modules/rooms/rooms.routes'
import type { AppVariables } from './types/context'

const app = new Hono<{
  Variables: AppVariables
}>()

app.use('*', requestIdMiddleware)
app.use('*', logger())
app.use('*', cors())
app.get('/test', (c) => c.text('test ok'))
app.get('/', (c) => c.text('Hono based API is running'))

app.route('/auth', authRouter)
app.route('/rooms', roomsRouter)
app.route('/messages', messagesRouter)
app.onError(errorHandler)

serve({
  fetch: app.fetch,
  port: env.PORT,
})

console.log(`🚀 Server is running on http://localhost:${env.PORT}`)
