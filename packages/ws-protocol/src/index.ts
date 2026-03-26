export type WSMessage = ServerMessage | ClientMessage

// 🔽 Server → Client
export type ServerMessage = {
  type: 'MESSAGE_NEW'
  payload: {
    id: string
    roomId: string
    senderId: string
    content: string | null
    createdAt: string
  }
}

// 🔽 Client → Server
export type ClientMessage = {
  type: 'ACK'
  payload: {
    messageId: string
  }
}
