import { emitMessageCreated } from '@chat/events'
import type { SendMessageInput } from '@chat/validation'
import { ConflictError } from '../../lib/errors'
import { roomsService } from '../rooms/rooms.service'
import { decodeCursor, encodeCursor } from './messages.cursor'
import { messagesRepository } from './messages.repository'

export const messagesService = {
  async sendMessage(userId: string, input: SendMessageInput) {
    await roomsService.assertRoomAccess(userId, input.roomId)

    if (input.replyToId) {
      const replyMsg = await messagesRepository.getMessageById(input.replyToId)

      if (!replyMsg || replyMsg.roomId !== input.roomId) {
        throw new ConflictError('Invalid reply message')
      }
    }

    const message = await messagesRepository.createMessage({
      roomId: input.roomId,
      senderId: userId,
      content: input.content,
      replyToId: input.replyToId,
    })
    emitMessageCreated({ message })
    return message
  },

  async getMessages(userId: string, roomId: string) {
    await roomsService.assertRoomAccess(userId, roomId)
    return messagesRepository.getMessagesByRoom(roomId)
  },

  async getMessagesPaginated(userId: string, roomId: string, cursor?: string, limit: number = 20) {
    await roomsService.assertRoomAccess(userId, roomId)

    const decodedCursor = cursor ? decodeCursor(cursor) : undefined

    const messages = await messagesRepository.getMessagesByRoomPaginated({
      roomId,
      cursor: decodedCursor,
      limit,
    })

    if (messages.length === 0) {
      return {
        messages: [],
        nextCursor: null,
      }
    }

    const last = messages[messages.length - 1]

    const nextCursor = last
      ? encodeCursor({
          createdAt: last.createdAt.toISOString(),
          id: last.id,
        })
      : null

    return {
      messages,
      nextCursor,
    }
  },
}
