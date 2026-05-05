import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).max(50),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceName: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

export const updateUserSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  avatarUrl: z.string().url('Must be a valid URL').optional(),
  bio: z.string().max(160).optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
