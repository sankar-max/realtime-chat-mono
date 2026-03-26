import { env } from '@chat/config'
import jwt from 'jsonwebtoken'

type DecodedToken = {
  sub?: string
}

export function verifyToken(token: string) {
  const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken

  console.log('🔍 decoded token:', decoded)

  if (!decoded.sub) {
    throw new Error('Missing sub in token')
  }

  return {
    userId: decoded.sub,
  }
}
