import type { Message } from '@chat/types'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { nanoid } from 'nanoid'

export type MessageStatus = 'sending' | 'sent' | 'failed'

export interface OptimisticMessage extends Omit<Message, 'updatedAt'> {
  status: MessageStatus
  /** client-side only temp id */
  tempId: string
  updatedAt?: string
}

interface MessagesState {
  /** Real-time messages from WebSocket, keyed by roomId */
  byRoom: Record<string, OptimisticMessage[]>
}

const initialState: MessagesState = {
  byRoom: {},
}

export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    /**
     * Called immediately when the user hits Send.
     * Adds a "sending" optimistic message to the room.
     */
    addOptimisticMessage: {
      reducer(state, action: PayloadAction<OptimisticMessage>) {
        const { roomId } = action.payload
        if (!state.byRoom[roomId]) {
          state.byRoom[roomId] = []
        }
        state.byRoom[roomId].push(action.payload)
      },
      prepare(payload: { roomId: string; content: string; senderId: string }) {
        const tempId = `temp-${nanoid()}`
        return {
          payload: {
            id: tempId,
            tempId,
            roomId: payload.roomId,
            content: payload.content,
            senderId: payload.senderId,
            createdAt: new Date().toISOString(),
            status: 'sending' as MessageStatus,
          },
        }
      },
    },

    /**
     * Called when we receive the real NEW_MESSAGE from the WS server.
     * Replaces the optimistic temp message with the real confirmed message
     * OR just adds the incoming message if it's from another user.
     */
    confirmOrAddMessage(
      state,
      action: PayloadAction<{
        roomId: string
        message: Omit<OptimisticMessage, 'status' | 'tempId'>
        tempId?: string
      }>,
    ) {
      const { roomId, message, tempId } = action.payload
      if (!state.byRoom[roomId]) {
        state.byRoom[roomId] = []
      }
      const room = state.byRoom[roomId]

      if (tempId) {
        // Replace the optimistic message with the confirmed one
        const idx = room.findIndex((m) => m.tempId === tempId)
        if (idx !== -1) {
          room[idx] = { ...message, tempId, status: 'sent' }
          return
        }
      }

      // De-dupe: don't add the same server message twice
      const alreadyExists = room.some((m) => m.id === message.id)
      if (!alreadyExists) {
        room.push({ ...message, tempId: message.id, status: 'sent' })
      }
    },

    /**
     * Called when the WS send fails (e.g., auth error).
     * Marks the optimistic message as failed so the user can retry or dismiss.
     */
    rollbackMessage(state, action: PayloadAction<{ roomId: string; tempId: string }>) {
      const { roomId, tempId } = action.payload
      const room = state.byRoom[roomId]
      if (!room) return
      const msg = room.find((m) => m.tempId === tempId)
      if (msg) {
        msg.status = 'failed'
      }
    },

    /**
     * Called on retry: resets a failed message to "sending".
     */
    retryMessage(state, action: PayloadAction<{ roomId: string; tempId: string }>) {
      const { roomId, tempId } = action.payload
      const room = state.byRoom[roomId]
      if (!room) return
      const msg = room.find((m) => m.tempId === tempId)
      if (msg) {
        msg.status = 'sending'
        msg.createdAt = new Date().toISOString()
      }
    },

    /**
     * Dismiss (remove) a failed message.
     */
    dismissMessage(state, action: PayloadAction<{ roomId: string; tempId: string }>) {
      const { roomId, tempId } = action.payload
      if (!state.byRoom[roomId]) return
      state.byRoom[roomId] = state.byRoom[roomId].filter((m) => m.tempId !== tempId)
    },

    /**
     * Called when switching rooms to clear stale optimistic messages.
     */
    clearRoomMessages(state, action: PayloadAction<{ roomId: string }>) {
      delete state.byRoom[action.payload.roomId]
    },
  },
})

export const {
  addOptimisticMessage,
  confirmOrAddMessage,
  rollbackMessage,
  retryMessage,
  dismissMessage,
  clearRoomMessages,
} = messagesSlice.actions

export default messagesSlice.reducer
