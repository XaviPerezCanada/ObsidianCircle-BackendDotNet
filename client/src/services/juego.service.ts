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

/** Tipo genérico para resultados paginados del backend */
export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}

/** Parámetros de búsqueda para juegos */
export type BoardGameSearchParams = {
  /** Texto de búsqueda (título, slug, descripción, género, editorial) */
  q?: string
  /** Número de jugadores: filtrar juegos que admitan al menos este número */
  jugadores?: number
  /** Orden: titulo_asc, titulo_desc, o por defecto por Id */
  sort?: string
  /** Número de página (por defecto 1) */
  page?: number
  /** Tamaño de página (por defecto 10, máximo 50) */
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

  getMyJuegos: async () => {
    return await api.get<Juego[]>('/BoardGames/mis-juegos/list')
  },

  /**
   * Búsqueda paginada con filtros
   * @param params Parámetros de búsqueda (q, jugadores, sort, page, limit)
   * @returns Resultado paginado con items, page, pageSize, totalCount
   */
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
