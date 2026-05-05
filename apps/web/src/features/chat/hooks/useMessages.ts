import { useQuery } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import { useMemo, useRef } from 'react'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { useWs } from '@/lib/ws-context'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  addOptimisticMessage,
  dismissMessage,
  retryMessage,
  rollbackMessage,
} from '@/store/messages/messagesSlice'
import { chatService } from '../api/chatService'

export function useMessages(roomId?: string) {
  const dispatch = useAppDispatch()
  const { send: wsSend, status: wsStatus } = useWs()
  const user = useAuthStore((s) => s.user)

  // A map from tempId → pending WS resolve
  const pendingMap = useRef<Map<string, string>>(new Map())

  // ── 1. TanStack Query: fetch historical messages ──────────────────────────
  const historyQuery = useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => chatService.getMessages(roomId!),
    enabled: !!roomId,
    staleTime: 30 * 1000,
  })

  // ── 2. RTK: live optimistic messages for this room ────────────────────────
  const liveMessages = useAppSelector((s) => s.messages.byRoom[roomId ?? ''] ?? [])

  // ── 3. Merge: history (de-duped) + live optimistic layer ─────────────────
  const messages = useMemo(() => {
    const history = historyQuery.data?.messages ?? []
    const historyIds = new Set(history.map((m) => m.id))

    // Only show live messages that aren't already in the history response
    const newLive = liveMessages.filter(
      (m) => m.status !== 'sent' || !historyIds.has(m.id),
    )

    const reversedHistory = [...history].reverse()
    return [...reversedHistory, ...newLive]
  }, [historyQuery.data, liveMessages])

  // ── 4. sendMessage: optimistic → WS → rollback on failure ─────────────────
  const sendMessage = (content: string) => {
    if (!roomId || !user) return
    if (wsStatus !== 'connected') return

    // Generate tempId upfront
    const tempId = `temp-${nanoid()}`

    // 4a. Add optimistic message to Redux
    dispatch(
      addOptimisticMessage({
        roomId,
        content,
        senderId: user.id,
      }),
    )

    // 4b. Send over WebSocket
    const sent = wsSend({
      type: 'SEND_MESSAGE',
      payload: { roomId, content, tempId },
    })

    if (!sent) {
      // WS send failed immediately (not connected), rollback
      dispatch(rollbackMessage({ roomId, tempId }))
    }
  }

  const retryFailed = (msgTempId: string) => {
    if (!roomId || !user) return
    dispatch(retryMessage({ roomId, tempId: msgTempId }))

    const msg = liveMessages.find((m) => m.tempId === msgTempId)
    if (!msg) return

    const sent = wsSend({
      type: 'SEND_MESSAGE',
      payload: { roomId, content: msg.content, tempId: msgTempId },
    })
    if (!sent) {
      dispatch(rollbackMessage({ roomId, tempId: msgTempId }))
    }
  }

  const dismissFailed = (msgTempId: string) => {
    if (!roomId) return
    dispatch(dismissMessage({ roomId, tempId: msgTempId }))
  }

  return {
    messages,
    nextCursor: historyQuery.data?.nextCursor ?? null,
    isLoading: historyQuery.isLoading,
    wsStatus,
    sendMessage,
    retryFailed,
    dismissFailed,
  }
}
