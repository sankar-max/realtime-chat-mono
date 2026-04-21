import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { roomService } from '../api/roomService'

export function useRooms() {
  const queryClient = useQueryClient()

  const roomsQuery = useQuery({
    queryKey: ['rooms'],
    queryFn: roomService.getRooms,
    staleTime: 30 * 1000,
  })

  const createRoomMutation = useMutation({
    mutationFn: roomService.createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Room created')
    },
  })

  const createDMMutation = useMutation({
    mutationFn: roomService.createDM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
  })

  return {
    rooms: roomsQuery.data || [],
    isLoading: roomsQuery.isLoading,
    createRoom: createRoomMutation.mutate,
    isCreating: createRoomMutation.isPending,
    createDM: createDMMutation.mutate,
    isCreatingDM: createDMMutation.isPending,
  }
}
