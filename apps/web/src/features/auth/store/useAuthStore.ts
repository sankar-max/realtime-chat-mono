import type { User } from '@chat/types'
import { create } from 'zustand'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    set({ user: null })
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}))
