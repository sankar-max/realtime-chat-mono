import type { WebSocket } from 'ws'

export type Connection = {
  userId: string
  socket: WebSocket
}

class ConnectionManager {
  private connections = new Map<string, Connection>()

  add(userId: string, socket: WebSocket) {
    this.connections.set(userId, { userId, socket })
  }

  remove(userId: string) {
    this.connections.delete(userId)
  }

  get(userId: string) {
    return this.connections.get(userId)
  }

  getAll() {
    return this.connections
  }
}

export const connectionManager = new ConnectionManager()
