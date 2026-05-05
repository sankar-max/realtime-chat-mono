import { AuthError, ConflictError } from '../errors'
import type { RoomRepository } from '../repositories/room.repository'
import type { CreateRoomInput } from '@chat/validation'

export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  async assertRoomAccess(userId: string, roomId: string) {
    if (!userId) throw new AuthError('Unauthorized')
    const isMember = await this.roomRepository.isUserInRoom(userId, roomId)
    if (!isMember) {
      throw new AuthError('Not a member of this room')
    }
  }

  async getUserRooms(userId: string) {
    if (!userId) throw new AuthError('Unauthorized')
    return this.roomRepository.getUserRooms(userId)
  }

  async createRoom(userId: string, data: CreateRoomInput) {
    if (!userId) throw new AuthError('Unauthorized')
    return this.roomRepository.createRoom(userId, data)
  }

  async createDMRoom(userId: string, targetUserId: string) {
    if (!userId) throw new AuthError('Unauthorized')
    if (userId === targetUserId) {
      throw new ConflictError('Cannot create DM with yourself')
    }
    // We generate DM key consistently (smaller ID first)
    const dmKey = userId < targetUserId ? `${userId}_${targetUserId}` : `${targetUserId}_${userId}`
    return this.roomRepository.getOrCreateDMRoom(userId, targetUserId, dmKey)
  }
}
