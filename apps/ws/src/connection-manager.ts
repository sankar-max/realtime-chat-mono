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
    userConnections.add(socket)
  }

  remove(ws: WSConnection) {
    const userConnections = this.connections.get(ws.userId)
    userConnections?.delete(ws.socket)
    if (userConnections?.size === 0) {
      this.connections.delete(ws.userId)
    }
  }

  isOnline(userId: string): boolean {
    const conns = this.connections.get(userId)
    return !!conns && conns.size > 0
  }

  sendToUser(userId: string, message: ServerMessage) {
    const userConnections = this.connections.get(userId)
    if (!userConnections) return

    const serialized = JSON.stringify(message)
    // Fixed: was nested forEach (N² sends) — now a single loop
    for (const ws of userConnections) {
      if (ws.readyState === ws.OPEN) {
        ws.send(serialized)
      }
    }
  }

  sendToRoom(memberIds: string[], message: ServerMessage) {
    const serialized = JSON.stringify(message)
    for (const userId of memberIds) {
      const userConnections = this.connections.get(userId)
      if (!userConnections) continue
      for (const ws of userConnections) {
        if (ws.readyState === ws.OPEN) {
          ws.send(serialized)
        }
      }
    }
  }

  getConnections(userId: string) {
    return this.connections.get(userId)
  }
}

export const connectionManager = new ConnectionManager()
