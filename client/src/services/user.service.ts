import { api } from '@/src/lib/api'

// ------- Tipos catálogo usuarios (admin/listado) -------

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

// ------- Tipos perfil usuario autenticado (ProfileController) -------

export type ProfileUser = {
  username: string
  email: string
  slug: string
  type: string
  bio?: string | null
  image?: string | null
}

export type UpdateProfileRequest = Partial<{
  username: string
  email: string
  password: string
  bio: string | null
  image: string | null
}>

type UserEnvelope<T> = {
  user: T
}

export const userService = {
  // ---- Endpoints de administración / catálogo ----
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

  // ---- Endpoints de perfil (usuario autenticado) ----
  getProfile: async () => {
    const res = await api.get<UserEnvelope<ProfileUser>>('/Profile')
    return res.data.user
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    const payload: UserEnvelope<{
      Username?: string
      Email?: string
      Password?: string
      Bio?: string | null
      Image?: string | null
    }> = {
      user: {
        Username: data.username,
        Email: data.email,
        Password: data.password,
        Bio: data.bio,
        Image: data.image,
      },
    }

    const res = await api.put<UserEnvelope<ProfileUser>>('/Profile', payload)
    return res.data.user
  },
}
