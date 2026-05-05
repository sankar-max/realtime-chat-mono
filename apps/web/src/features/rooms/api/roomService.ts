import type { Room } from '@chat/types'
import apiClient from '@/lib/api-client'

export const roomService = {
  async getRooms(): Promise<Room[]> {
    const response = await apiClient.get('/rooms')
    return response.data.data
  },

  async createRoom(name: string, type: 'direct' | 'group' = 'group', memberIds?: string[]): Promise<Room> {
    const response = await apiClient.post('/rooms/create', { name, type, memberIds })
    return response.data.data
  },

  async createDM(targetUserId: string): Promise<Room> {
    const response = await apiClient.put('/rooms/dm', { targetUserId })
    return response.data.data
  },
}
