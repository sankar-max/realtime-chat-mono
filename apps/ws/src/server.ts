import { type WebSocket, WebSocketServer } from 'ws'

const wss = new WebSocketServer({
  port: 3002,
})

// userId → multiple connections (tabs/devices)
const connections = new Map<string, Set<WebSocket>>()

console.log('🚀 WS server running on ws://localhost:3002')

wss.on('connection', (ws, req) => {
  // 1️⃣ Extract userId from URL
  const url = new URL(req.url || '', 'http://localhost')
  const userId = url.searchParams.get('userId')

  if (!userId) {
    ws.close()
    return
  }

  // 2️⃣ Get or create user's connection set
  let userConnections = connections.get(userId)

  if (!userConnections) {
    userConnections = new Set()
    connections.set(userId, userConnections)
  }

  // 3️⃣ Add this socket to user's connections
  userConnections.add(ws)

  console.log(`✅ ${userId} connected (total: ${userConnections.size})`)

  // 4️⃣ Handle incoming messages
  ws.on('message', (message) => {
    const text = message.toString()
    console.log(`📩 ${userId}:`, text)

    // 🔥 Example: send message to ALL user's tabs
    userConnections?.forEach((socket) => {
      socket.send(`Echo: ${text}`)
    })
  })

  // 5️⃣ Handle disconnect
  ws.on('close', () => {
    const userConnections = connections.get(userId)

    if (!userConnections) return

    userConnections.delete(ws)

    if (userConnections.size === 0) {
      connections.delete(userId)
    }

    console.log(`❌ ${userId} disconnected`)
  })
})
