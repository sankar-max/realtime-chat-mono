import { type AccessTokenPayload, verifyAccessToken } from '@chat/utils'
import type { Context, Next } from 'hono'
import { AuthError } from '../lib/errors'
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

  let payload: AccessTokenPayload
  try {
    payload = verifyAccessToken(token)
  } catch (err) {
    throw new AuthError(err instanceof Error ? err.message : 'Invalid token')
  }

  c.set('userId', payload.sub)
  c.set('sessionId', payload.sid)

  const session = await authRepository.findSessionById(payload.sid)
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
