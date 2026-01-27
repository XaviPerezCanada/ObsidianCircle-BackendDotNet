// services/auth.service.ts
import { api } from '@/src/lib/api'

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

export type AuthUser = {
  id: number
  name: string
  email: string
  tipo?: 'BASICO' | 'SOCIO' | 'ADMIN'
}

// Ajusta estos tipos a lo que devuelva tu backend
export type AuthResponse = {
  accessToken?: string
  refreshToken?: string
  token?: string
  user?: AuthUser
}

export const authService = {
  register: async (data: RegisterRequest) => {
    return await api.post<AuthResponse>('/usuarios/register', data)
  },
  login: async (data: LoginRequest) => {
    return await api.post<AuthResponse>('/usuarios/login', data)
  },
  refresh: async () => {
    return await api.post<AuthResponse>('/auth/refresh')
  },
  logout: async () => {
    return await api.post('/auth/logout')
  },
}
  