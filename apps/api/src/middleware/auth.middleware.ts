import type { Context, Next } from 'hono'
import { AuthError } from '../lib/errors'
import { verifyAccessToken } from '../lib/jwt'
import { authRepository } from '../modules/auth/auth.repository'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    throw new AuthError('Authorization header missing')
  }

  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new AuthError('Invalid authorization header')
  }

  const payload = verifyAccessToken(token)
  c.set('userId', payload.sub)
  c.set('sessionId', payload.sid)

  const session = await authRepository.findSessionByToken(payload.sid)
  if (!session) {
    throw new AuthError('Invalid session')
  }
  if (session.revokedAt) {
    throw new AuthError('Session revoked')
  }

  if (session.expiresAt < new Date()) {
    throw new AuthError('Session expired')
  }
  await next()
}
