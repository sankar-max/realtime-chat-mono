import { index, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { rooms } from './rooms'
import { users } from './users'

export const callTypeEnum = pgEnum('call_type', ['voice', 'video'])

export const callStatusEnum = pgEnum('call_status', ['ongoing', 'ended', 'missed'])

export const calls = pgTable(
  'calls',
  {
    id: varchar('id', { length: 255 }).primaryKey(),

    roomId: varchar('room_id', { length: 255 })
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),

    callerId: varchar('caller_id', { length: 255 })
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

    callerIndex: index('calls_caller_idx').on(table.callerId),
  }),
)

export const callParticipantStatusEnum = pgEnum('call_participant_status', ['joined', 'declined', 'missed'])

export const callParticipants = pgTable(
  'call_participants',
  {
    id: varchar('id', { length: 255 }).primaryKey(),

    callId: varchar('call_id', { length: 255 })
      .notNull()
      .references(() => calls.id, { onDelete: 'cascade' }),

    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    status: callParticipantStatusEnum('status').notNull(),

    joinedAt: timestamp('joined_at'),

    leftAt: timestamp('left_at'),
  },
  (table) => ({
    callIndex: index('call_participants_call_idx').on(table.callId),

    userIndex: index('call_participants_user_idx').on(table.userId),
  }),
)
