import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { rooms } from './rooms'
import { users } from './users'

export const callTypeEnum = pgEnum('call_type', ['voice', 'video'])

export const callStatusEnum = pgEnum('call_status', ['ongoing', 'ended', 'missed'])

export const calls = pgTable(
  'calls',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),

    callerId: uuid('caller_id')
      .notNull()
      .references(() => users.id),

    type: callTypeEnum('type').notNull(),

    status: callStatusEnum('status').notNull(),

    recordingUrl: text('recording_url'),

    startedAt: timestamp('started_at').defaultNow().notNull(),

    endedAt: timestamp('ended_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    roomIndex: index('calls_room_idx').on(table.roomId),
  }),
)
export const callParticipantStatusEnum = pgEnum('call_participant_status', ['joined', 'declined', 'missed'])

export const callParticipants = pgTable(
  'call_participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    callId: uuid('call_id')
      .notNull()
      .references(() => calls.id, { onDelete: 'cascade' }),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    status: callParticipantStatusEnum('status').notNull(),

    joinedAt: timestamp('joined_at'),

    leftAt: timestamp('left_at'),
  },
  (table) => ({
    callIndex: index('call_participants_call_idx').on(table.callId),
  }),
)
