import type { SendMessageInput } from '@chat/validation'
import { ConflictError } from '../errors'
import { decodeCursor, encodeCursor } from '../utils/cursor'
import type { MessageRepository } from '../repositories/message.repository'
import type { RoomService } from './room.service'

export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly roomService: RoomService,
  ) {}

  async sendMessage(userId: string, input: SendMessageInput) {
    await this.roomService.assertRoomAccess(userId, input.roomId)

    if (input.replyToId) {
      const replyMsg = await this.messageRepository.getMessageById(input.replyToId)

      if (!replyMsg || replyMsg.roomId !== input.roomId) {
        throw new ConflictError('Invalid reply message')
      }
    }

    const message = await this.messageRepository.createMessage({
      roomId: input.roomId,
      senderId: userId,
      content: input.content,
      replyToId: input.replyToId,
    })
    return message
  }

  async getMessages(userId: string, roomId: string) {
    await this.roomService.assertRoomAccess(userId, roomId)
    const messages = await this.messageRepository.getMessagesByRoom(roomId)
    return messages.map(({ sender, ...m }) => ({
      ...m,
      senderName: sender?.displayName,
    }))
  }

  async getMessagesPaginated(userId: string, roomId: string, cursor?: string, limit: number = 20) {
    await this.roomService.assertRoomAccess(userId, roomId)

    const decodedCursor = cursor ? decodeCursor(cursor) : undefined

    const messages = await this.messageRepository.getMessagesByRoomPaginated({
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

    const mappedMessages = messages.map(({ sender, ...m }) => ({
      ...m,
      senderName: sender?.displayName,
    }))

    return {
      messages: mappedMessages,
      nextCursor,
    }
  }

  async getRoomReceipts(userId: string, roomId: string) {
    await this.roomService.assertRoomAccess(userId, roomId)
    return this.messageRepository.getRoomReceipts(roomId)
  }
}
