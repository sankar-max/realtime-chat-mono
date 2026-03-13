import { index, pgEnum, pgTable, primaryKey, timestamp, varchar } from 'drizzle-orm/pg-core'
import { messages } from './messages'
import { users } from './users'

export const messageReceiptStatusEnum = pgEnum('message_receipt_status', ['delivered', 'read'])

export const messageReceipts = pgTable(
  'message_receipts',
  {
    messageId: varchar('message_id', { length: 255 })
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),

    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    status: messageReceiptStatusEnum('status').notNull(),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.messageId, table.userId] }),

    userIndex: index('message_receipts_user_idx').on(table.userId),

    messageIndex: index('message_receipts_message_idx').on(table.messageId),
  }),
)
