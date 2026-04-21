import { sendMessageSchema } from '@chat/validation'
import { Hono } from 'hono'
import { sendSuccess } from '../../lib/response'
import { authMiddleware } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validator.middleware'
import type { AppVariables } from '../../types/context'
import { messagesService } from './messages.service'

export const messagesRouter = new Hono<{ Variables: AppVariables }>()

messagesRouter.post('/', authMiddleware, validate('json', sendMessageSchema), async (c) => {
  const userId = c.get('userId')
  const data = c.req.valid('json')

  const message = await messagesService.sendMessage(userId, data)

  return sendSuccess(c, message)
})

messagesRouter.get('/:roomId', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const roomId = c.req.param('roomId') as string
  const cursor = c.req.query('cursor')
  const limit = Math.min(Number(c.req.query('limit') || 20), 100)

  const messages = await messagesService.getMessagesPaginated(userId, roomId, cursor, limit)

  return sendSuccess(c, messages)
})

messagesRouter.get('/:roomId/receipts', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const roomId = c.req.param('roomId')
  const receipts = await messagesService.getRoomReceipts(userId, roomId!)
  return sendSuccess(c, receipts)
})
