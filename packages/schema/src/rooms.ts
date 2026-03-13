import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const roomTypeEnum = pgEnum('room_type', ['direct', 'group'])

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: varchar('name', { length: 255 }),

  type: roomTypeEnum('type').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
