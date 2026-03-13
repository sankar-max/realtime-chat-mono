import type { Context, Next } from 'hono'
import { verifyAccessToken } from '../lib/jwt'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) return c.json({ error: 'UnAuthorized' }, 401)

  const token = authHeader.split(' ')[1]

  if (!token) return c.json({ error: 'Token is not provided' }, 401)

  try {
    const payload = verifyAccessToken(token)
    c.set('userId', payload.sub)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}
