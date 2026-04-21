import type { Message } from '@chat/types'
import type { SendMessageInput } from '@chat/validation'
import apiClient from '@/lib/api-client'

export const chatService = {
  async getMessages(
    roomId: string,
    cursor?: string,
    limit = 50,
  ): Promise<{ messages: Message[]; nextCursor: string | null }> {
    const response = await apiClient.get(`/messages/${roomId}`, {
      params: { cursor, limit },
    })
    return response.data.data
  },

  async sendMessage(data: SendMessageInput): Promise<Message> {
    const response = await apiClient.post('/messages', data)
    return response.data.data
  },
}
