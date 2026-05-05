import { create } from 'zustand'

interface PresenceState {
  onlineUsers: Set<string>
  setOnlineUsers: (userIds: string[]) => void
  setUserOnline: (userId: string, isOnline: boolean) => void
}

export const usePresenceStore = create<PresenceState>()((set) => ({
  onlineUsers: new Set(),
  
  setOnlineUsers: (userIds) => set({ 
    onlineUsers: new Set(userIds) 
  }),
  
  setUserOnline: (userId, isOnline) => set((state) => {
    const newSet = new Set(state.onlineUsers)
    if (isOnline) {
      newSet.add(userId)
    } else {
      newSet.delete(userId)
    }
    return { onlineUsers: newSet }
  })
}))
