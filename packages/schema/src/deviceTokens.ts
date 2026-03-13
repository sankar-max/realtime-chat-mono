import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { users } from './users'

export const deviceProviderEnum = pgEnum('device_provider', ['expo', 'fcm', 'apns'])

export const deviceTokens = pgTable(
  'device_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    token: text('token').notNull(),

    provider: deviceProviderEnum('provider').notNull(),

    deviceId: varchar('device_id', { length: 255 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIndex: index('device_tokens_user_idx').on(table.userId),
  }),
)
