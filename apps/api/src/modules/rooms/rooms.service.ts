import { AuthError } from '../../lib/errors'
import { roomsRepository } from './rooms.repository'
import type { CreateRoomInput } from './rooms.schema'

export const roomsService = {
  async getUserRooms(userId: string) {
    if (!userId) {
      throw new AuthError('Unauthorized')
    }

    return roomsRepository.getUserRooms(userId)
  },
  async createRoom(userId: string, data: CreateRoomInput) {
    if (!userId) {
      throw new AuthError('Unauthorized')
    }
    return roomsRepository.createRoom(userId, data)
  },
  async createDMRoom(userId: string, targetUserId: string) {
    if (!userId) {
      throw new AuthError('Unauthorized')
    }
    if (!targetUserId) {
      throw new AuthError('Target user is required')
    }
    if (userId === targetUserId) {
      throw new Error('Cannot create DM with yourself')
    }
    return roomsRepository.getORCreateDMRoom(userId, targetUserId)
  },
}
