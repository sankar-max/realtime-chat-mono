import { db } from '@chat/db'

// Repositories
import { AuthRepository } from './repositories/auth.repository'
import { MessageRepository } from './repositories/message.repository'
import { RoomRepository } from './repositories/room.repository'

// Services
import { AuthService } from './services/auth.service'
import { MessageService } from './services/message.service'
import { RoomService } from './services/room.service'

// Instantiate repositories
export const authRepository = new AuthRepository(db)
export const messageRepository = new MessageRepository(db)
export const roomRepository = new RoomRepository(db)

// Instantiate services
export const authService = new AuthService(authRepository)
export const roomService = new RoomService(roomRepository)
export const messageService = new MessageService(messageRepository, roomService)

// Export classes for typing or custom instantiation
export * from './repositories/auth.repository'
export * from './repositories/message.repository'
export * from './repositories/room.repository'
export * from './services/auth.service'
export * from './services/message.service'
export * from './services/room.service'
export * from './errors'
export * from './utils/cursor'
