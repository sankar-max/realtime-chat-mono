import type { ServerMessage } from '@chat/ws-types'
import type { WebSocket } from 'ws'
export type WSConnection = {
  userId: string
  socket: WebSocket
}

class ConnectionManager {
  private connections = new Map<string, Set<WebSocket>>()

  add(ws: WSConnection) {
    const { socket, userId } = ws

    let userConnections = this.connections.get(userId)

    if (!userConnections) {
      userConnections = new Set()
      this.connections.set(userId, userConnections)
    }
    userConnections?.add(socket)
  }
  remove(ws: WSConnection) {
    const userConnections = this.connections.get(ws.userId)
    userConnections?.delete(ws.socket)
    if (userConnections?.size === 0) {
      this.connections.delete(ws.userId)
    }
  }
  sendToUser(userId: string, message: ServerMessage) {
    const userConnections = this.connections.get(userId)

    console.log('📡 sendToUser called for:', userId)

    if (!userConnections) {
      console.log('❌ No connections found for user')
      return
    }

    console.log('📡 total sockets:', userConnections.size)
    const serialized = JSON.stringify(message)
    userConnections.forEach((ws) => {
      console.log('📡 socket state:', ws.readyState)

      userConnections.forEach((ws) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(serialized)
        }
      })
    })
  }
  getConnections(userId: string) {
    return this.connections.get(userId)
  }
}

export const connectionManager = new ConnectionManager()
