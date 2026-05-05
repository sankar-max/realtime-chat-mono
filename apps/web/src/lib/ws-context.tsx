'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { useAppDispatch } from '@/store'
import { type WsStatus, wsClient } from './ws-client'

interface WsContextValue {
  status: WsStatus
  send: typeof wsClient.send
}

const WsContext = createContext<WsContextValue>({
  status: 'idle',
  send: () => false,
})

export function WsProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<WsStatus>('idle')
  const user = useAuthStore((s) => s.user)
  const dispatchBound = useRef(false)

  // Bind dispatch once
  useEffect(() => {
    if (dispatchBound.current) return
    dispatchBound.current = true
    wsClient.init(dispatch)
    const unsub = wsClient.onStatusChange(setStatus)
    return () => {
      unsub()
    }
  }, [dispatch])

  // Connect / disconnect when auth state changes
  useEffect(() => {
    if (user) {
      // User just logged in — get the fresh token and connect
      const token = localStorage.getItem('accessToken')
      if (token && token !== 'undefined' && token !== 'null') {
        wsClient.connect(token)
      }
    } else {
      // User logged out — cleanly disconnect
      wsClient.disconnect()
    }
  }, [user])

  return (
    <WsContext.Provider value={{ status, send: wsClient.send.bind(wsClient) }}>
      {children}
    </WsContext.Provider>
  )
}

export function useWs() {
  return useContext(WsContext)
}
