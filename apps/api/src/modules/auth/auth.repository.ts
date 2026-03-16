import { db } from '@chat/db'
import { sessions, users } from '@chat/schema'
import { createId } from '@chat/utils'
import { addDays } from 'date-fns'
import { eq } from 'drizzle-orm'

export const authRepository = {
  async createUser(data: { email: string; passwordHash: string; displayName: string }) {
    const [user] = await db
      .insert(users)
      .values({
        id: createId(),
        email: data.email,
        passwordHash: data.passwordHash,
        displayName: data.displayName,
      })
      .returning()

    return user
  },

  async findUserByEmail(email: string) {
    const [user] = await db
      .select({
        email: users.email,
        displayName: users.displayName,
        passwordHash: users.passwordHash,
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email))

    return user ?? null
  },
  async findUserById(userId: string) {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, userId))
    return user ?? null
  },

  async createSession(data: { userId: string; refreshToken: string }) {
    const [session] = await db
      .insert(sessions)
      .values({
        id: createId(),
        userId: data.userId,
        refreshToken: data.refreshToken,
        expiresAt: addDays(new Date(), 30),
      })
      .returning()

    return session
  },
}
