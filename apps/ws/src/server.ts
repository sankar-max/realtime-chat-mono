import 'dotenv/config'
import { env } from '@chat/config'
import { authService } from '@chat/core'
import { verifyAccessToken } from '@chat/utils'
import { WebSocketServer } from 'ws'
import { connectionManager } from './connection-manager'
import { messageRouter } from './core/message-router'

const wss = new WebSocketServer({ port: env.WS_PORT })

wss.on('connection', async (ws, req) => {
  try {
    const url = new URL(req.url || '', 'http://localhost')
    const token = url.searchParams.get('token')

    if (!token) {
      ws.close(4001, 'Unauthorized')
      return
    }

    // Verify JWT signature + expiry
    let payload: ReturnType<typeof verifyAccessToken>
    try {
      payload = verifyAccessToken(token)
    } catch {
      ws.close(4001, 'Invalid token')
      return
    }

    const userId = payload.sub

    // Validate session: check it exists, isn't revoked, isn't expired
    const session = await authService.verifySession(payload.sid)

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      ws.close(4001, 'Session invalid or expired')
      return
    }

    const isNewConnection = !connectionManager.isOnline(userId)
    
    connectionManager.add({ userId, socket: ws })

    if (isNewConnection) {
      connectionManager.broadcast({
        type: 'PRESENCE_UPDATE',
        payload: { userId, status: 'online' }
      })
    }

    // Send the current list of online users to the newly connected user
    connectionManager.sendToUser(userId, {
      type: 'ONLINE_USERS_LIST',
      payload: { userIds: connectionManager.getOnlineUsers() }
    })

    ws.on('message', (data) => {
      const text = data.toString()
      messageRouter.handle(userId, text)
    })

    ws.on('close', () => {
      connectionManager.remove({ userId, socket: ws })
      
      // If the user has no more connections, broadcast offline
      if (!connectionManager.isOnline(userId)) {
        connectionManager.broadcast({
          type: 'PRESENCE_UPDATE',
          payload: { userId, status: 'offline' }
        })
      }
    })
  } catch (error) {
    console.error('❌ WS connection error:', error)
    ws.close(4001, 'Connection error')
  }
})

console.log(`🚀 WS server running on ws://localhost:${env.WS_PORT}`)
