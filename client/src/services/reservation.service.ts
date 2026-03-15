import { api } from '@/src/lib/api'

export type ReservaEstado = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA'

export type TimeSlot = 'Morning' | 'Afternoon' | 'FullDay' | 'Night'

export type Reserva = {
  id: string
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
  sala_id: string
  juego_id?: number | null
  fecha: string
  franja_id: TimeSlot
  notas?: string | null
}

export type UpdateReservationRequest = Partial<Omit<CreateReservationRequest, 'slug'>>

// Respuesta del backend (ReservationResponse)
type ReservationResponseDto = {
  id: string
  slug: string
  gameRoomId: string
  userId: string
  date: string
  slot: TimeSlot
  estado: number // 0 Active, 1 Cancelled - o string según serialización
  boardGameId?: number | null
}

const mapFromDto = (dto: ReservationResponseDto): Reserva => ({
  id: dto.id,
  slug: dto.slug,
  sala_id: dto.gameRoomId,
  usuario_id: dto.userId,
  juego_id: dto.boardGameId ?? null,
  fecha: dto.date,
  franja_id: dto.slot,
  estado: dto.estado === 1 ? 'CANCELADA' : 'CONFIRMADA',
  notas: null,
  created_at: undefined,
})

export const reservationService = {
  /** Reservas del usuario autenticado */
  getMine: async (): Promise<Reserva[]> => {
    const res = await api.get<ReservationResponseDto[]>('/reservations/mine')
    return res.data.map(mapFromDto)
  },

  /** Todas las reservas (solo Admin) */
  getAllAdmin: async (): Promise<Reserva[]> => {
    const res = await api.get<ReservationResponseDto[]>('/reservations/all')
    return res.data.map(mapFromDto)
  },

  /** Reservas de una sala para una fecha (ocupación del día) */
  getByDateAndRoom: async (date: string, gameRoomId: string): Promise<Reserva[]> => {
    const res = await api.get<ReservationResponseDto[]>('/reservations/by-date', {
      params: { date: date, gameRoomId },
    })
    return res.data.map(mapFromDto)
  },

  /** Obtener una reserva por slug */
  getBySlug: async (slug: string): Promise<Reserva> => {
    const res = await api.get<ReservationResponseDto>(
      `/reservations/${encodeURIComponent(slug)}`
    )
    return mapFromDto(res.data)
  },

  /** Crear reserva (userId lo asigna el backend desde el token) */
  create: async (data: CreateReservationRequest): Promise<Reserva> => {
    const payload = {
      gameRoomId: data.sala_id,
      date: data.fecha,
      slot: data.franja_id,
      boardGameId: data.juego_id ?? null,
    }
    const res = await api.post<ReservationResponseDto>('/reservations', payload)
    return mapFromDto(res.data)
  },

  /** Cancelar reserva por slug */
  cancel: async (slug: string): Promise<void> => {
    await api.delete(`/reservations/${encodeURIComponent(slug)}`)
  },
}
