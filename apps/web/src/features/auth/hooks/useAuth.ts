import type { LoginInput, RegisterInput } from '@chat/validation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { authService } from '../api/authService'
import { useAuthStore } from '../store/useAuthStore'

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { user: storeUser, setUser, logout: storeLogout } = useAuthStore()

  const userQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled:
      typeof window !== 'undefined' &&
      !!localStorage.getItem('accessToken') &&
      localStorage.getItem('accessToken') !== 'undefined',
  })

  // Sync query data to store
  useEffect(() => {
    if (userQuery.isSuccess && userQuery.data?.data) {
      setUser(userQuery.data.data)
    } else if (!userQuery.isLoading && !userQuery.isFetching && !userQuery.data) {
      setUser(null)
    }
  }, [userQuery.data, userQuery.isSuccess, userQuery.isLoading, userQuery.isFetching, setUser])

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (response) => {
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      setUser(response.data.user)
      queryClient.setQueryData(['auth', 'me'], { data: response.data.user })
      toast.success('Logged in successfully')
      router.push('/chat')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: () => {
      toast.success('Registration successful! You can now login.')
      router.push('/login')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      storeLogout()
      queryClient.setQueryData(['auth', 'me'], null)
      toast.success('Logged out successfully')
      router.push('/login')
    },
    onError: () => {
      toast.error('Logout failed')
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: import('@chat/validation').UpdateUserInput) => authService.updateProfile(data),
    onSuccess: (response) => {
      setUser(response.data)
      queryClient.setQueryData(['auth', 'me'], { data: response.data })
      toast.success('Profile updated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    },
  })

  const isInitialLoading = userQuery.isPending && userQuery.fetchStatus !== 'idle'

  return {
    user: storeUser || userQuery.data?.data,
    isLoading: isInitialLoading,
    isError: userQuery.isError,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
  }
}
