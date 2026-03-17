import { createId } from '@chat/utils'
import bcrypt from 'bcryptjs'
import { AuthError, ConflictError } from '../../lib/errors'
import { generateAccessToken } from '../../lib/jwt'
import { authRepository } from './auth.repository'

export const authService = {
  async register(data: { email: string; password: string; displayName: string }) {
    const existingUser = await authRepository.findUserByEmail(data.email)

    if (existingUser) {
      throw new ConflictError('User already exists')
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    const user = await authRepository.createUser({
      email: data.email,
      passwordHash,
      displayName: data.displayName,
    })

    const { passwordHash: userPassword, ...rest } = user

    return rest
  },

  async login(data: { email: string; password: string }) {
    const user = await authRepository.findUserByEmail(data.email)

    if (!user) {
      throw new AuthError('Invalid credentials')
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash)

    if (!isValidPassword) {
      throw new AuthError('Invalid credentials')
    }

    const { passwordHash, ...safeUser } = user

    const refreshToken = createId()

    const session = await authRepository.createSession({
      userId: user.id,
      refreshToken,
    })

    const accessToken = generateAccessToken(user.id, session.id)

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    }
  },
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new AuthError('Refresh token required')
    }

    const session = await authRepository.findSessionByToken(refreshToken)

    if (!session) {
      throw new AuthError('Invalid session')
    }

    if (session.revokedAt) {
      throw new AuthError('Session revoked')
    }

    if (session.expiresAt < new Date()) {
      throw new AuthError('Session expired')
    }

    const accessToken = generateAccessToken(session.userId, session.id)

    return { accessToken }
  },
  async logout(sessionId: string) {
    await authRepository.revokeSession(sessionId)
  },
  async getMe(userId: string) {
    const user = await authRepository.findUserById(userId)
    if (!user) return null
    const { passwordHash: userPassword, ...rest } = user
    return rest
  },
}
