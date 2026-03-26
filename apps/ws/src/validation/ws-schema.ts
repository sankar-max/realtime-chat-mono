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
