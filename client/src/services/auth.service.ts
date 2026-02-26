// services/auth.service.ts
import { api } from '@/src/lib/api'

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  username: string
  email: string
  password: string
}

export type AuthUser = {
  id?: number
  username?: string
  name?: string
  email: string
  slug?: string
  type?: 'BASICO' | 'SOCIO' | 'ADMIN' | string
  tipo?: 'BASICO' | 'SOCIO' | 'ADMIN' | string
  bio?: string | null
  image?: string | null
}


export type AuthResponse = {
  accessToken?: string
  refreshToken?: string
  token?: string
  user?: AuthUser
}

export const authService = {
  register: async (data: RegisterRequest) => {
    // El backend espera directamente el objeto User en el cuerpo,
    // no envuelto dentro de una propiedad Body.
    return await api.post<AuthResponse>('/Auth/register', {
      User: {
        Username: data.username,
        Email: data.email,
        Password: data.password,
      },
    })
  },
  login: async (data: LoginRequest) => {
    return await api.post<AuthResponse>('/Auth/login', data)
  },
  refresh: async () => {
    return await api.post<AuthResponse>('/Auth/refresh')
  },
  logout: async () => {
    return await api.post('/Auth/logout')
  },
  logoutAll: async () => {
    return await api.post('/Auth/logout-all')
  },
}
  