import 'dotenv/config'
import { env } from '@chat/config'
import { createId } from '@chat/utils'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { authRouter } from './modules/auth/auth.routes'
import type { AppVariables } from './types/context'

const id = createId()
const app = new Hono<{
  Variables: AppVariables
}>()

app.get('/', (c) => {
  return c.text('Moreno API running')
})

app.route('/auth', authRouter)

serve({
  fetch: app.fetch,
  port: env.PORT,
})

console.log(`🚀 Server is running on http://localhost:${env.PORT}`)
