import { index, integer, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { messages } from './messages'

export const attachmentTypeEnum = pgEnum('attachment_type', ['image', 'video', 'file', 'audio'])

export const attachments = pgTable(
  'attachments',
  {
    id: varchar('id', { length: 255 }).primaryKey(),

    messageId: varchar('message_id', { length: 255 })
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),

    url: text('url').notNull(),

    type: attachmentTypeEnum('type').notNull(),

    name: text('name').notNull(),

    size: integer('size').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    messageIndex: index('attachments_message_idx').on(table.messageId),
  }),
)
