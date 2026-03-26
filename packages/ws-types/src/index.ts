import { z } from 'zod'

export const ClientMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('PING') }),

  z.object({
    type: z.literal('SEND_MESSAGE'),
    payload: z.object({
      roomId: z.string(),
      content: z.string(),
      replyToId: z.string().optional(),
    }),
  }),
])

export type ClientMessage = z.infer<typeof ClientMessageSchema>

// 👇 ADD THIS ALSO (IMPORTANT)
export const ServerMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('PONG') }),

  z.object({
    type: z.literal('ERROR'),
    payload: z.object({
      message: z.string(),
    }),
  }),
])

export type ServerMessage = z.infer<typeof ServerMessageSchema>
