import type { User } from '@chat/types'

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  data: AuthResponse
  message?: string
}

export interface RegisterResponse {
  data: User
  message?: string
}

export interface RefreshResponse {
  data: {
    accessToken: string
  }
  message?: string
}

export interface MeResponse {
  data: User
  message?: string
}
