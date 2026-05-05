import { createId, generateAccessToken } from '@chat/utils'
import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'
import { AuthError, ConflictError, NotFoundError } from '../errors'
import type { AuthRepository } from '../repositories/auth.repository'

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(data: { email: string; password: string; displayName: string }) {
    const existingUser = await this.authRepository.findUserByEmail(data.email)

    if (existingUser) {
      throw new ConflictError('User already exists')
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    const user = await this.authRepository.createUser({
      email: data.email,
      passwordHash,
      displayName: data.displayName,
    })

    const { passwordHash: userPassword, ...rest } = user

    return rest
  }

  async login(
    data: { email: string; password: string },
    deviceInfo?: { deviceIp?: string; deviceName?: string; userAgent?: string },
  ) {
    const user = await this.authRepository.findUserByEmail(data.email)

    if (!user) {
      throw new AuthError('Invalid credentials')
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash)

    if (!isValidPassword) {
      throw new AuthError('Invalid credentials')
    }

    const { passwordHash, ...safeUser } = user
    const refreshToken = createId()
    const hashedToken = createHash('sha256').update(refreshToken).digest('hex')

    const session = await this.authRepository.createSession({
      userId: user.id,
      refreshToken: hashedToken,
      ...deviceInfo,
    })

    const accessToken = generateAccessToken(user.id, session.id)

    return {
      user: safeUser,
      accessToken,
      refreshToken: refreshToken,
    }
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new AuthError('Refresh token required')
    }

    const hashedToken = createHash('sha256').update(refreshToken).digest('hex')
    const session = await this.authRepository.findSessionByToken(hashedToken)

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
  }

  async logout(sessionId: string) {
    await this.authRepository.revokeSession(sessionId)
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findUserById(userId)
    if (!user) throw new NotFoundError('User not found')
    const { passwordHash: userPassword, ...rest } = user
    return rest
  }

  async getAllUsers(excludeUserId: string) {
    return this.authRepository.getAllUsers(excludeUserId)
  }

  async verifySession(sessionId: string) {
    const session = await this.authRepository.findSessionById(sessionId)
    return session
  }
}
