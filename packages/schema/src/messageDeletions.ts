import { index, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core'

import { messages } from './messages'
import { users } from './users'

export const messageDeletions = pgTable(
  'message_deletions',
  {
    messageId: uuid('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    deletedAt: timestamp('deleted_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.messageId, table.userId],
    }),

    userIndex: index('message_deletions_user_idx').on(table.userId),

    messageIndex: index('message_deletions_message_idx').on(table.messageId),
  }),
)
