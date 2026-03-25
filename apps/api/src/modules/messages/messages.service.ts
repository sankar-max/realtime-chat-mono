import type { SendMessageInput } from '@chat/validation'
import { AuthError, ConflictError } from '../../lib/errors'
import { roomsRepository } from '../rooms/rooms.repository'
import { decodeCursor, encodeCursor } from './messages.cursor'
import { messagesRepository } from './messages.repository'

export const messagesService = {
  async sendMessage(userId: string, input: SendMessageInput) {
    if (!userId) throw new AuthError('Unauthorized')

    // 1️⃣ Check membership
    const isMember = await roomsRepository.isUserInRoom(userId, input.roomId)

    if (!isMember) {
      throw new AuthError('Not a member of this room')
    }

    // 2️⃣ Validate reply
    if (input.replyToId) {
      const replyMsg = await messagesRepository.getMessageById(input.replyToId)

      if (!replyMsg || replyMsg.roomId !== input.roomId) {
        throw new ConflictError('Invalid reply message')
      }
    }

    // 3️⃣ Create message
    return messagesRepository.createMessage({
      roomId: input.roomId,
      senderId: userId,
      content: input.content,
      replyToId: input.replyToId,
    })
  },

  async getMessages(userId: string, roomId: string) {
    if (!userId) throw new AuthError('Unauthorized')

    const isMember = await roomsRepository.isUserInRoom(userId, roomId)

    if (!isMember) {
      throw new AuthError('Not a member of this room')
    }

    return messagesRepository.getMessagesByRoom(roomId)
  },
  async getMessagesPaginated(userId: string, roomId: string, cursor?: string, limit: number = 20) {
    if (!userId) throw new AuthError('Unauthorized')

    const isMember = await roomsRepository.isUserInRoom(userId, roomId)

    if (!isMember) {
      throw new AuthError('Not a member of this room')
    }

    const decodedCursor = cursor ? decodeCursor(cursor) : undefined

    const messages = await messagesRepository.getMessagesByRoomPaginated({
      roomId,
      cursor: decodedCursor,
      limit,
    })

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
