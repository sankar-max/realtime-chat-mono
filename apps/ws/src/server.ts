import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({
  port: 3002,
})

console.log('🚀 WS server running on ws://localhost:3002')

wss.on('connection', (ws) => {
  console.log('Client connected')

  ws.on('message', (message) => {
    console.log('Received:', message.toString())
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })
})
