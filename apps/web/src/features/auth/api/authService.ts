import type { LoginInput, RegisterInput } from '@chat/validation'
import apiClient from '@/lib/api-client'
import type { LoginResponse, MeResponse, RegisterResponse } from '../types'

export const authService = {
  async login(data: LoginInput): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  async register(data: RegisterInput): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data)
    return response.data
  },

  async getMe(): Promise<MeResponse> {
    const response = await apiClient.get<MeResponse>('/auth/me')
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },
}
