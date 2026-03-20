import { z } from 'zod'

export const sendMessageSchema = z.object({
  roomId: z.string(),
  content: z.string().min(1),
  replyToId: z.string().optional(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
