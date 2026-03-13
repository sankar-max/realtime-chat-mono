import { env } from '@chat/config'
import jwt from 'jsonwebtoken'

type AccessTokenPayload = {
  sub: string
}

export function generateAccessToken(userId: string): string {
  if (!userId) {
    throw new Error('userId is required')
  }

  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '15m' })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  if (!token) {
    throw new Error('Token required')
  }

  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload
}
