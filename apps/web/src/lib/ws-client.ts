import type { ClientMessage, ServerMessage } from '@chat/ws-types'
import type { AppDispatch } from '@/store'
import { confirmOrAddMessage } from '@/store/messages/messagesSlice'
import { usePresenceStore } from '@/store/usePresenceStore'

export type WsStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'auth-failed'
type StatusListener = (status: WsStatus) => void

// WS close codes that are auth rejections and must NOT use regular reconnect
const AUTH_REJECTION_CODES = new Set([4001])

/**
 * A singleton WebSocket client manager.
 *
 * - Manages the raw WS connection lifecycle.
 * - On auth rejection (4001): silently refreshes the token, then reconnects.
 * - On unrecoverable auth failure: stops and sets status to 'auth-failed'.
 * - On normal network drop: exponential backoff reconnect.
 */
class WsClient {
  private socket: WebSocket | null = null
  private dispatch: AppDispatch | null = null
  private statusListeners: Set<StatusListener> = new Set()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5

  status: WsStatus = 'idle'

  private setStatus(s: WsStatus) {
    this.status = s
    this.statusListeners.forEach((cb) => cb(s))
  }

  /** Call once to bind the Redux dispatch. */
  init(dispatch: AppDispatch) {
    this.dispatch = dispatch
  }

  /** Subscribe to WS connection status changes. Returns an unsubscribe fn. */
  onStatusChange(cb: StatusListener): () => void {
    this.statusListeners.add(cb)
    return () => this.statusListeners.delete(cb)
  }

  connect(token: string) {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    this.setStatus('connecting')
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002'}?token=${token}`

    this.socket = new WebSocket(wsUrl)

    this.socket.onopen = () => {
      this.reconnectAttempts = 0
      this.setStatus('connected')
    }

    this.socket.onclose = (event) => {
      console.warn('⚠️ WS closed', event.code, event.reason)

      if (AUTH_REJECTION_CODES.has(event.code)) {
        // Token is bad — try to silently refresh before retrying
        this.handleAuthFailure()
        return
      }

      // Normal network disconnect — exponential backoff
      this.setStatus('disconnected')
      this.scheduleReconnect(token)
    }

    this.socket.onerror = () => {
      // onerror is always followed by onclose, so let onclose drive the state
      this.setStatus('error')
    }

    this.socket.onmessage = (event) => {
      this.handleMessage(event.data)
    }
  }

  /**
   * When we get a 4001, try to silently refresh the access token once.
   * Success  → reconnect with the new token.
   * Failure  → set 'auth-failed', stop reconnecting (user must re-login).
   */
  private async handleAuthFailure() {
    this.setStatus('disconnected')

    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
      console.error('❌ WS: No refresh token. Auth failed.')
      this.setStatus('auth-failed')
      return
    }

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!res.ok) throw new Error(`Refresh HTTP ${res.status}`)

      const json = await res.json()
      const newToken: string | undefined = json?.data?.accessToken

      if (!newToken) throw new Error('No accessToken in refresh response')

      localStorage.setItem('accessToken', newToken)
      console.log('🔄 WS: Token refreshed — reconnecting…')

      this.reconnectAttempts = 0
      this.scheduleReconnect(newToken)
    } catch (err) {
      console.error('❌ WS: Token refresh failed — stopping reconnect.', err)
      this.setStatus('auth-failed')
    }
  }

  private handleMessage(raw: string) {
    if (!this.dispatch) return

    let msg: ServerMessage
    try {
      msg = JSON.parse(raw) as ServerMessage
    } catch {
      return
    }

    switch (msg.type) {
      case 'NEW_MESSAGE':
        this.dispatch(
          confirmOrAddMessage({
            roomId: msg.payload.roomId,
            message: {
              id: msg.payload.id,
              roomId: msg.payload.roomId,
              senderId: msg.payload.senderId,
              content: msg.payload.content ?? '',
              createdAt: msg.payload.createdAt,
              replyToId: msg.payload.replyToId ?? null,
            },
          }),
        )
        break

      case 'RECEIPT_UPDATE':
        // Future: dispatch receipt state update here
        break

      case 'ERROR':
        console.error('WS server error:', msg.payload.message)
        break

      case 'PRESENCE_UPDATE':
        usePresenceStore.getState().setUserOnline(msg.payload.userId, msg.payload.status === 'online')
        break

      case 'ONLINE_USERS_LIST':
        usePresenceStore.getState().setOnlineUsers(msg.payload.userIds)
        break

      case 'PONG':
        // Keep-alive — no action needed
        break
    }
  }

  /** Send a typed message. Returns false if not connected. */
  send(msg: ClientMessage): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false
    }
    this.socket.send(JSON.stringify(msg))
    return true
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.socket?.close(1000, 'Client disconnected')
    this.socket = null
    this.reconnectAttempts = 0
    this.setStatus('idle')
  }

  private scheduleReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max WS reconnect attempts reached.')
      this.setStatus('error')
      return
    }
    // Exponential backoff: 1 → 2 → 4 → 8 → 16s, capped at 30s
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000)
    this.reconnectAttempts++
    console.log(`⏳ Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    this.reconnectTimer = setTimeout(() => this.connect(token), delay)
  }
}

// Singleton
export const wsClient = new WsClient()
