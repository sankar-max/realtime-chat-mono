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
  sendToUser(userId: string, message: string) {
    const userConnections = this.connections.get(userId)

    console.log('📡 sendToUser called for:', userId)
    console.log('📡 connections map:', this.connections)

    if (!userConnections) {
      console.log('❌ No connections found for user')
      return
    }

    console.log('📡 total sockets:', userConnections.size)

    userConnections.forEach((ws) => {
      console.log('📡 socket state:', ws.readyState)

      if (ws.readyState === ws.OPEN) {
        console.log('🚀 sending message:', message)
        ws.send(message)
      } else {
        console.log('❌ socket not open')
      }
    })
  }
  getConnections(userId: string) {
    return this.connections.get(userId)
  }
}

export const connectionManager = new ConnectionManager()
