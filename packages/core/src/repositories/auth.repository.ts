import { sessions, users } from '@chat/schema'
import { createId } from '@chat/utils'
import { addDays } from 'date-fns'
import { eq, ne } from 'drizzle-orm'
import type { db } from '@chat/db'

export class AuthRepository {
  constructor(private readonly database: typeof db) {}

  async createUser(data: { email: string; passwordHash: string; displayName: string }) {
    const [user] = await this.database
      .insert(users)
      .values({
        id: createId(),
        email: data.email,
        passwordHash: data.passwordHash,
        displayName: data.displayName,
      })
      .returning()

    return user
  }

  async findUserByEmail(email: string) {
    const [user] = await this.database
      .select({
        email: users.email,
        displayName: users.displayName,
        passwordHash: users.passwordHash,
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email))

    return user ?? null
  }

  async findUserById(userId: string) {
    const [user] = await this.database
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, userId))
    return user ?? null
  }

  async getAllUsers(excludeUserId: string) {
    return this.database
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
      })
      .from(users)
      .where(ne(users.id, excludeUserId))
  }

  async updateUser(userId: string, data: { displayName?: string; avatarUrl?: string; bio?: string }) {
    const [user] = await this.database
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    if (!user) return undefined

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    }
  }

  async findSessionByToken(refreshToken: string) {
    return this.database.query.sessions.findFirst({
      where: eq(sessions.refreshToken, refreshToken),
    })
  }

  async findSessionById(sessionId: string) {
    return this.database.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    })
  }

  async revokeSession(sessionId: string) {
    await this.database.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, sessionId))
  }

  async createSession(data: {
    userId: string
    refreshToken: string
    deviceIp?: string
    deviceName?: string
    userAgent?: string
  }) {
    const [session] = await this.database
      .insert(sessions)
      .values({
        id: createId(),
        userId: data.userId,
        refreshToken: data.refreshToken,
        expiresAt: addDays(new Date(), 30),
        deviceIp: data.deviceIp,
        deviceName: data.deviceName,
        userAgent: data.userAgent,
      })
      .returning()

    return session
  }
}
