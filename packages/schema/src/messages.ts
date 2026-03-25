import { boolean, index, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { rooms } from './rooms'
import { users } from './users'

export const messageTypeEnum = pgEnum('message_type', ['text', 'image', 'video', 'file', 'system'])

export const messages = pgTable(
  'messages',
  {
    id: varchar('id', { length: 255 }).primaryKey(),

    roomId: varchar('room_id', { length: 255 })
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),

    senderId: varchar('sender_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    type: messageTypeEnum('type').default('text').notNull(),

    content: text('content'),

    replyToId: varchar('reply_to_id', { length: 255 }).references((): any => messages.id, { onDelete: 'set null' }),

    isDeletedForEveryone: boolean('is_deleted_for_everyone').default(false).notNull(),

    editedAt: timestamp('edited_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    roomMessagesIndex: index('messages_room_created_id_idx').on(table.roomId, table.createdAt.desc(), table.id.desc()),

    senderIndex: index('messages_sender_idx').on(table.senderId),

    replyToIndex: index('messages_reply_to_idx').on(table.replyToId),
  }),
)
