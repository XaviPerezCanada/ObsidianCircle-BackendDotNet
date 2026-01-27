import { api } from '@/src/lib/api'

export type CatalogUser = {
  id: number
  slug: string
  nombre: string
  email: string
  telefono?: string | null
  status: 'ACTIVE' | 'INACTIVE'
  tipo: 'BASICO' | 'SOCIO' | 'ADMIN'
  created_at: string
  updated_at?: string | null
}

export type CreateUserRequest = {
  slug: string
  nombre: string
  email: string
  password: string
  telefono?: string
  status?: 'ACTIVE' | 'INACTIVE'
  tipo?: 'BASICO' | 'SOCIO' | 'ADMIN'
}

export type UpdateUserRequest = Partial<{
  nombre: string
  email: string
  password: string
  telefono: string
  status: 'ACTIVE' | 'INACTIVE'
  tipo: 'BASICO' | 'SOCIO' | 'ADMIN'
}>

export const userService = {
  getAll: async () => {
    const res = await api.get<{ data: CatalogUser[] }>('/usuarios')
    return res.data.data
  },

  getBySlug: async (slug: string) => {
    return await api.get<CatalogUser>(`/usuarios/${encodeURIComponent(slug)}`)
  },

  create: async (data: CreateUserRequest) => {
    return await api.post<CatalogUser>('/usuarios', data)
  },

  update: async (slug: string, data: UpdateUserRequest) => {
    return await api.put<CatalogUser>(`/usuarios/${encodeURIComponent(slug)}`, data)
  },

  delete: async (slug: string) => {
    return await api.delete(`/usuarios/${encodeURIComponent(slug)}`)
  },
}

