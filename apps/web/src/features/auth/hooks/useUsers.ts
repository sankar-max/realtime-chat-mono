import { useQuery } from '@tanstack/react-query'
import { userService } from '../api/userService'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
  })
}
