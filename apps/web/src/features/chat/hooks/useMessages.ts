import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { chatService } from '../api/chatService'

export function useMessages(roomId?: string) {
  const queryClient = useQueryClient()

  const messagesQuery = useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => chatService.getMessages(roomId!),
    enabled: !!roomId,
    staleTime: 10 * 1000,
  })

  const sendMessageMutation = useMutation({
    mutationFn: chatService.sendMessage,
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['messages', roomId], (old: any) => {
        if (!old) return { messages: [newMessage], nextCursor: null }
        return {
          ...old,
          messages: [...old.messages, newMessage],
        }
      })
    },
    onError: () => {
      toast.error('Failed to send message')
    },
  })

  return {
    messages: messagesQuery.data?.messages || [],
    nextCursor: messagesQuery.data?.nextCursor || null,
    isLoading: messagesQuery.isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  }
}
