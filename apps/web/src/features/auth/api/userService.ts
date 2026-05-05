import type { User } from '@chat/types'
import apiClient from '@/lib/api-client'

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get('/users')
    return response.data.data
  },
}
