import { api } from '@/src/lib/api'

export type ReservaEstado = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA'

export type Reserva = {
  id?: number
  slug: string
  sala_id: number
  usuario_id: number
  juego_id?: number | null
  fecha: string // YYYY-MM-DD
  franja_id: number
  estado: ReservaEstado
  notas?: string | null
  created_at?: string
}

export type CreateReservaRequest = {
  slug: string
  sala_id: number
  usuario_id: number
  juego_id?: number | null
  fecha: string
  franja_id: number
  estado?: ReservaEstado
  notas?: string | null
}

export type UpdateReservaRequest = Partial<Omit<CreateReservaRequest, 'slug'>>

export const reservaService = {
  getAll: async () => {
    const res = await api.get<{ data: Reserva[] }>('/reservas')
    return res.data.data
  },

  getBySlug: async (slug: string) => {
    return await api.get<Reserva>(`/reservas/${encodeURIComponent(slug)}`)
  },

  create: async (data: CreateReservaRequest) => {
    return await api.post<Reserva>('/reservas', data)
  },

  update: async (slug: string, data: UpdateReservaRequest) => {
    return await api.put<Reserva>(`/reservas/${encodeURIComponent(slug)}`, data)
  },

  delete: async (slug: string) => {
    return await api.delete(`/reservas/${encodeURIComponent(slug)}`)
  },
}

