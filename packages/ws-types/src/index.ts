import { z } from 'zod'

// ─── Client → Server ────────────────────────────────────────────────────────

export const ClientMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('PING') }),

  z.object({
    type: z.literal('SEND_MESSAGE'),
    payload: z.object({
      roomId: z.string(),
      content: z.string(),
      replyToId: z.string().optional(),
      tempId: z.string().optional(),
    }),
  }),

  z.object({
    type: z.literal('MARK_READ'),
    payload: z.object({
      roomId: z.string(),
      lastReadMessageId: z.string(),
    }),
  }),
])

export type ClientMessage = z.infer<typeof ClientMessageSchema>

// ─── Server → Client ────────────────────────────────────────────────────────

export const ServerMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('PONG') }),

  z.object({
    type: z.literal('NEW_MESSAGE'),
    payload: z.object({
      id: z.string(),
      roomId: z.string(),
      senderId: z.string(),
      senderName: z.string().nullable().optional(),
      content: z.string().nullable(),
      type: z.string(),
      replyToId: z.string().nullable().optional(),
      createdAt: z.string(),
      tempId: z.string().nullable().optional(),
    }),
  }),

  z.object({
    type: z.literal('RECEIPT_UPDATE'),
    payload: z.object({
      roomId: z.string(),
      messageId: z.string(),
      userId: z.string(),
      status: z.enum(['delivered', 'read']),
      updatedAt: z.string(),
    }),
  }),

  z.object({
    type: z.literal('ERROR'),
    payload: z.object({
      message: z.string(),
    }),
  }),

  z.object({
    type: z.literal('PRESENCE_UPDATE'),
    payload: z.object({
      userId: z.string(),
      status: z.enum(['online', 'offline']),
    }),
  }),

  z.object({
    type: z.literal('ONLINE_USERS_LIST'),
    payload: z.object({
      userIds: z.array(z.string()),
    }),
  }),
])

export type ServerMessage = z.infer<typeof ServerMessageSchema>
