import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'

export const sessions = pgTable(
  'sessions',
  {
    id: varchar('id', { length: 255 }).primaryKey(),

    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    refreshToken: text('refresh_token').notNull(),

    deviceName: varchar('device_name', { length: 100 }),

    deviceIp: varchar('device_ip', { length: 45 }),

    userAgent: text('user_agent'),

    expiresAt: timestamp('expires_at').notNull(),

    revokedAt: timestamp('revoked_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIndex: index('sessions_user_idx').on(table.userId),
    expiresIndex: index('sessions_expires_idx').on(table.expiresAt),
  }),
)
