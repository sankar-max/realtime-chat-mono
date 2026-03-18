import { env } from '@chat/config'
import jwt from 'jsonwebtoken'

export type AccessTokenPayload = {
  sub: string
  sid: string
}

export function generateAccessToken(userId: string, sessionId: string): string {
  if (!userId || !sessionId) {
    throw new Error('userId and sessionId are required')
  }

  return jwt.sign(
    {
      sub: userId,
      sid: sessionId,
    },
    env.JWT_SECRET,
    { expiresIn: '15m' },
  )
}
export function verifyAccessToken(token: string): AccessTokenPayload {
  if (!token) {
    throw new Error('Token required')
  }

  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload
}
