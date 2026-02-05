import { api } from '@/src/lib/api'

export type ReservaEstado = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA'

export type TimeSlot = 'Morning' | 'Afternoon' | 'FulllDay' | 'Night'

export type Reserva = {
  id?: string
  slug: string
  sala_id: string
  usuario_id: string
  juego_id?: number | null
  fecha: string // YYYY-MM-DD
  franja_id: TimeSlot
  estado: ReservaEstado
  notas?: string | null
  created_at?: string
}

export type CreateReservationRequest = {
  slug: string
  sala_id: string
  usuario_id: string
  juego_id?: number | null
  fecha: string
  franja_id: TimeSlot
  estado?: ReservaEstado
  notas?: string | null
}

export type UpdateReservationRequest = Partial<Omit<CreateReservationRequest, 'slug'>>

export const reservationService = {
  getAll: async () => {
    const res = await api.get<{ data: Reserva[] }>('/reservations')
    return res.data.data
  },

  getBySlug: async (slug: string) => {
    return await api.get<Reserva>(`/reservations/${encodeURIComponent(slug)}`)
  },

  create: async (data: CreateReservationRequest) => {
    return await api.post<Reserva>('/reservations', data)
  },

  update: async (slug: string, data: UpdateReservationRequest) => {
    return await api.put<Reserva>(`/reservations/${encodeURIComponent(slug)}`, data)
  },

  delete: async (slug: string) => {
    return await api.delete(`/reservations/${encodeURIComponent(slug)}`)
  },
}

