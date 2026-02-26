import { api } from '@/src/lib/api'
import { buildQueryFromParams } from '@/src/utils/BuildQuery'

/** Coincide con la API (camelCase). */
export type Juego = {
  id: number
  slug: string
  socio: string
  editorial: string
  genero: string
  categoria: string
  titulo: string
  descripcion?: string | null
  jugadoresMin?: number | null
  jugadoresMax?: number | null
  edadRecomendada?: number | null
  duracionMinutos?: number | null
  observaciones?: string | null
  imagenUrl: string
  estado: string
  disponibilidad: string
  fechaRegistro: string
  fechaUltimaModificacion?: string | null
}

export type CreateJuegoRequest = {

  Titulo: string
  Socio: string
  JugadoresMin: number
  JugadoresMax: number
  descripcion?: string
  tipo?: 'MESA' | 'ROL'
  edad_minima?: number
  duracion_min?: number
  sistema?: string
  ambientacion?: string
  nivel_inicial?: number
  estado?: 'ACTIVO' | 'INACTIVO'
}

export type UpdateJuegoRequest = {
  Titulo?: string
  JugadoresMin?: number
  JugadoresMax?: number
}


export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}

/** Parámetros de búsqueda para juegos */
export type BoardGameSearchParams = {
  q?: string
  jugadores?: number
  sort?: string
  page?: number
  limit?: number
}

export const juegoService = {
  getAll: async () => {
    return await api.get<Juego[]>('/BoardGames')
  },

  getBySlug: async (slug: string) => {
    return await api.get<Juego>(`/BoardGames/${slug}`)
  },

  create: async (data: CreateJuegoRequest) => {
    return await api.post<Juego>('/BoardGames', data)
  },

  update: async (slug: string, data: UpdateJuegoRequest) => {
    return await api.put<Juego>(`/BoardGames/${encodeURIComponent(slug)}`, data)
  },

  // Versión usada por hooks antiguos (devuelve AxiosResponse)
  getMyJuegos: async () => {
    return await api.get<Juego[]>('/Profile/boardgames')
  },

  getMyGamesFromProfile: async () => {
    const res = await api.get<Juego[]>('/Profile/boardgames')
    return res.data
  },

  search: async (params: BoardGameSearchParams = {}) => {
    const queryString = buildQueryFromParams({
      q: params.q,
      jugadores: params.jugadores,
      sort: params.sort,
      page: params.page,
      limit: params.limit,
    })
    const url = `/BoardGames/search${queryString ? `?${queryString}` : ''}`
    const res = await api.get<PagedResult<Juego>>(url)
    return res.data
  },
}
