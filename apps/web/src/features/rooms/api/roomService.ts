import type { Room } from '@chat/types'
import apiClient from '@/lib/api-client'

export const roomService = {
  async getRooms(): Promise<Room[]> {
    const response = await apiClient.get('/rooms')
    return response.data.data
  },

  async createRoom(name: string): Promise<Room> {
    const response = await apiClient.post('/rooms/create', { name })
    return response.data.data
  },

  async createDM(targetUserId: string): Promise<Room> {
    const response = await apiClient.put('/rooms/dm', { targetUserId })
    return response.data.data
  },
}
