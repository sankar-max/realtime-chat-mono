import { pgEnum, pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'

export const roomTypeEnum = pgEnum('room_type', ['direct', 'group'])

export const rooms = pgTable(
  'rooms',
  {
    id: varchar('id', { length: 255 }).primaryKey(),

    name: varchar('name', { length: 255 }),

    dmKey: varchar('dm_key', { length: 255 }),

    type: roomTypeEnum('type').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    dmKeyIndex: uniqueIndex('rooms_dm_key_unique').on(table.dmKey),
  }),
)
