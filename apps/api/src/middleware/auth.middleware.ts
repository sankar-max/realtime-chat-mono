import type { Context, Next } from 'hono'
import { verifyAccessToken } from '../lib/jwt'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    return c.json({ error: 'Authorization header missing' }, 401)
  }

  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return c.json({ error: 'Invalid authorization header' }, 401)
  }

  try {
    const payload = verifyAccessToken(token)

    c.set('userId', payload.sub)
    c.set('sessionId', payload.sid)

    await next()
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}
