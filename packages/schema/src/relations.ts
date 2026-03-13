import { relations } from 'drizzle-orm'
import { attachments } from './attachments'
import { callParticipants, calls } from './calls'
import { deviceTokens } from './deviceTokens'
import { messageDeletions } from './messageDeletions'
import { messageReceipts } from './messageReceipts'
import { messages } from './messages'
import { roomMembers } from './roomMembers'
import { rooms } from './rooms'
import { sessions } from './sessions'
import { users } from './users'

// USERS
export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(roomMembers),
  messages: many(messages),
  sessions: many(sessions),
  deviceTokens: many(deviceTokens),
  callParticipants: many(callParticipants),
}))

// ROOMS
export const roomsRelations = relations(rooms, ({ many }) => ({
  memberships: many(roomMembers),
  messages: many(messages),
  calls: many(calls),
}))

// ROOM MEMBERS
export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
  room: one(rooms, {
    fields: [roomMembers.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [roomMembers.userId],
    references: [users.id],
  }),
}))

// MESSAGES
export const messagesRelations = relations(messages, ({ one, many }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),

  room: one(rooms, {
    fields: [messages.roomId],
    references: [rooms.id],
  }),

  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
    relationName: 'message_replies',
  }),

  replies: many(messages, {
    relationName: 'message_replies',
  }),

  attachments: many(attachments),

  receipts: many(messageReceipts),

  deletions: many(messageDeletions),
}))

// SESSIONS
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

// DEVICE TOKENS
export const deviceTokensRelations = relations(deviceTokens, ({ one }) => ({
  user: one(users, {
    fields: [deviceTokens.userId],
    references: [users.id],
  }),
}))

// ATTACHMENTS
export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(messages, {
    fields: [attachments.messageId],
    references: [messages.id],
  }),
}))

// CALLS
export const callsRelations = relations(calls, ({ one, many }) => ({
  room: one(rooms, {
    fields: [calls.roomId],
    references: [rooms.id],
  }),

  caller: one(users, {
    fields: [calls.callerId],
    references: [users.id],
  }),

  participants: many(callParticipants),
}))

// CALL PARTICIPANTS
export const callParticipantsRelations = relations(callParticipants, ({ one }) => ({
  call: one(calls, {
    fields: [callParticipants.callId],
    references: [calls.id],
  }),

  user: one(users, {
    fields: [callParticipants.userId],
    references: [users.id],
  }),
}))

// MESSAGE RECEIPTS
export const messageReceiptsRelations = relations(messageReceipts, ({ one }) => ({
  message: one(messages, {
    fields: [messageReceipts.messageId],
    references: [messages.id],
  }),

  user: one(users, {
    fields: [messageReceipts.userId],
    references: [users.id],
  }),
}))

// MESSAGE DELETIONS
export const messageDeletionsRelations = relations(messageDeletions, ({ one }) => ({
  message: one(messages, {
    fields: [messageDeletions.messageId],
    references: [messages.id],
  }),

  user: one(users, {
    fields: [messageDeletions.userId],
    references: [users.id],
  }),
}))
