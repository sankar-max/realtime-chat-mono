import 'dotenv/config'
import { env } from '@chat/config'
import { verifyAccessToken } from '@chat/utils'
import { WebSocketServer } from 'ws'
import { connectionManager } from './connection-manager'
import { messageRouter } from './core/message-router'

const wss = new WebSocketServer({ port: env.WS_PORT })

wss.on('connection', (ws, req) => {
  try {
    const url = new URL(req.url || '', 'http://localhost')
    const token = url.searchParams.get('token')

    if (!token) {
      ws.close(4001, 'Unauthorized')
      return
    }

    const payload = verifyAccessToken(token)
    const userId = payload.sub

    connectionManager.add({ userId, socket: ws })

    ws.on('message', (data) => {
      const text = data.toString()

      console.log('🔥 SERVER RECEIVED:', text)

      messageRouter.handle(userId, text)
    })

    ws.on('close', () => {
      connectionManager.remove({ userId, socket: ws })
    })
  } catch (error) {
    console.error('❌ Auth failed:', error)
    ws.close(4001, 'Invalid token')
  }
})

console.log(`🚀 WS server running on ws://localhost:${env.WS_PORT}`)
