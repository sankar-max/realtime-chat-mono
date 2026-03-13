import bcrypt from 'bcryptjs'
import { authRepository } from './auth.repository'

export const authService = {
  async register(data: { email: string; password: string; displayName: string }) {
    const existingUser = await authRepository.findUserByEmail(data.email)

    if (existingUser) {
      throw new Error('User already exists')
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    const user = await authRepository.createUser({
      email: data.email,
      passwordHash,
      displayName: data.displayName,
    })

    return user
  },

  async login(data: { email: string; password: string }) {
    const user = await authRepository.findUserByEmail(data.email)

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash)

    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    return user
  },
}
