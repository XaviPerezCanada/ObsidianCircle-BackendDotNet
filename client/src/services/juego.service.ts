import { api } from '@/src/lib/api'

export type Juego = {
  id: number
  slug: string
  propietario_id: number
  tipo: 'MESA' | 'ROL'
  nombre: string
  descripcion?: string | null
  min_jugadores?: number | null
  max_jugadores?: number | null
  edad_minima?: number | null
  duracion_min?: number | null
  sistema?: string | null
  ambientacion?: string | null
  nivel_inicial?: number | null
  estado: 'ACTIVO' | 'INACTIVO'
  created_at: string
  updated_at?: string | null
}

export type CreateJuegoRequest = {
  nombre: string
  descripcion?: string
  tipo: 'MESA' | 'ROL'
  min_jugadores?: number
  max_jugadores?: number
  edad_minima?: number
  duracion_min?: number
  sistema?: string
  ambientacion?: string
  nivel_inicial?: number
  estado?: 'ACTIVO' | 'INACTIVO'
}

export const juegoService = {
  getAll: async () => {
    return await api.get<Juego[]>('/juegos')
  },

  getBySlug: async (slug: string) => {
    return await api.get<Juego>(`/juegos/${slug}`)
  },

  create: async (data: CreateJuegoRequest) => {
    return await api.post<Juego>('/juegos', data)
  },

  getMyJuegos: async () => {
    return await api.get<Juego[]>('/juegos/mis-juegos/list')
  },
}
