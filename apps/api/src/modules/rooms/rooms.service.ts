import { AuthError, ConflictError } from '../../lib/errors'
import { generateDMKey } from '../../lib/gernerateDMKey'
import { roomsRepository } from './rooms.repository'
import type { CreateRoomInput } from './rooms.schema'
export const roomsService = {
  async assertRoomAccess(userId: string, roomId: string) {
    if (!userId) throw new AuthError('Unauthorized')
    const isMember = await roomsRepository.isUserInRoom(userId, roomId)
    if (!isMember) {
      throw new AuthError('Not a member of this room')
    }
  },

  async getUserRooms(userId: string) {
    if (!userId) throw new AuthError('Unauthorized')
    return roomsRepository.getUserRooms(userId)
  },

  async createRoom(userId: string, data: CreateRoomInput) {
    if (!userId) throw new AuthError('Unauthorized')
    return roomsRepository.createRoom(userId, data)
  },

  async createDMRoom(userId: string, targetUserId: string) {
    if (!userId) throw new AuthError('Unauthorized')
    if (userId === targetUserId) {
      throw new ConflictError('Cannot create DM with yourself')
    }
    const dmKey = generateDMKey(userId, targetUserId)
    return roomsRepository.getOrCreateDMRoom(userId, targetUserId, dmKey)
  },
}
