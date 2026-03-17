import type { Context, Next } from 'hono'
import { AuthError } from '../lib/errors'
import { verifyAccessToken } from '../lib/jwt'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    throw new AuthError('Authorization header missing')
  }

  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new AuthError('Invalid authorization header')
  }

  try {
    const payload = verifyAccessToken(token)

    c.set('userId', payload.sub)
    c.set('sessionId', payload.sid)

    await next()
  } catch {
    throw new AuthError('Invalid or expired token')
  }
}
