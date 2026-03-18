import { AuthError } from '../../lib/errors'
import { roomsRepository } from './rooms.repository'

export const roomsService = {
  async getUserRooms(userId: string) {
    if (!userId) {
      throw new AuthError('Unauthorized')
    }

    return roomsRepository.getUserRooms(userId)
  },
  async createRoom(userId: string, data: { name: string; type: string }) {
    if (!userId) {
      throw new AuthError('Unauthorized')
    }
    return roomsRepository.createRoom(userId, data)
  },
}
