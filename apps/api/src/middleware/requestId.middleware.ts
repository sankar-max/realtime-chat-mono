import { createId } from '@chat/utils'
import type { Context, Next } from 'hono'

export async function requestIdMiddleware(c: Context, next: Next) {
  const requestId = c.req.header('x-request-id') || createId()
  c.set('requestId', requestId)
  c.header('x-request-id', requestId)
  await next()
}
