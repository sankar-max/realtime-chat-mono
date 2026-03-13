import { boolean, index, pgEnum, pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'

import { rooms } from './rooms'
import { users } from './users'

export const roomRoleEnum = pgEnum('room_role', ['member', 'admin'])

export const roomMembers = pgTable(
  'room_members',
  {
    id: varchar('id', { length: 255 }).primaryKey(),

    roomId: varchar('room_id', { length: 255 })
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),

    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    role: roomRoleEnum('role').default('member').notNull(),

    isMuted: boolean('is_muted').default(false).notNull(),

    lastReadMessageId: varchar('last_read_message_id', { length: 255 }),

    lastDeliveredMessageId: varchar('last_delivered_message_id', {
      length: 255,
    }),

    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    roomIndex: index('room_members_room_idx').on(table.roomId),

    userIndex: index('room_members_user_idx').on(table.userId),

    membershipUnique: uniqueIndex('room_members_unique').on(table.roomId, table.userId),
  }),
)
