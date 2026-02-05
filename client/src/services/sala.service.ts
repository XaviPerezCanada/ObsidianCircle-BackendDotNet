import { api } from '@/src/lib/api'

/** Tipo genérico para resultados paginados del backend */
export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}

export type GameRoom = {
  id: string          
  name: string
  slug: string
  capacity: number
  status: string      // "Active", "Inactive", "UnderMaintenance"
  description: string
}

// 2. DTO para crear (Match con CreateGameRoomDto: Name, Capacity, Description)
// El slug se genera automáticamente en el backend
export type CreateGameRoomRequest = {
  name: string
  capacity: number
  description: string
}

// 3. DTO para editar (Match con UpdateGameRoomDto: Name, Capacity, Description)
export type UpdateGameRoomRequest = {
  name: string
  capacity: number
  description: string
}

/** Parámetros de búsqueda para salas */
export type GameRoomSearchParams = {

  q?: string

  capacity?: number[] | string

  sort?: string

  page?: number

  limit?: number
}


const ENDPOINT = '/GameRooms' 

export const gameRoomService = {
  // GET /api/GameRooms
  getAll: async () => {
    const res = await api.get<GameRoom[]>(ENDPOINT)
    return res.data
  },

  // GET /api/GameRooms/available
  getAvailable: async () => {
    const res = await api.get<GameRoom[]>(`${ENDPOINT}/available`)
    return res.data
  },

  // GET /api/GameRooms/{slug}
  getBySlug: async (slug: string) => {
    const res = await api.get<GameRoom>(`${ENDPOINT}/${encodeURIComponent(slug)}`)
    return res.data
  },

  /**
   * Búsqueda paginada con filtros
   * @param params Parámetros de búsqueda (q, capacity, sort, page, limit)
   * @returns Resultado paginado con items, page, pageSize, totalCount
   */
  search: async (params: GameRoomSearchParams = {}) => {
    const queryParams = new URLSearchParams()
    
    if (params.q) queryParams.append('q', params.q)
    
    // Manejar capacity: puede ser array [4,6,8] o string "4,6,8"
    if (params.capacity !== undefined) {
      const capacityStr = Array.isArray(params.capacity) 
        ? params.capacity.join(',') 
        : params.capacity
      queryParams.append('capacity', capacityStr)
    }
    
    if (params.sort) queryParams.append('sort', params.sort)
    if (params.page !== undefined) queryParams.append('page', params.page.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())

    const queryString = queryParams.toString()
    const url = `${ENDPOINT}/search${queryString ? `?${queryString}` : ''}`
    
    const res = await api.get<PagedResult<GameRoom>>(url)
    return res.data
  },

  // POST /api/GameRooms
  // Retorna: { slug: string } según el controller
  create: async (data: CreateGameRoomRequest) => {
    const res = await api.post<{ slug: string }>(ENDPOINT, data)
    return res.data
  },

  // PUT /api/GameRooms/{slug}
  update: async (slug: string, data: UpdateGameRoomRequest) => {
    const res = await api.put<void>(`${ENDPOINT}/${encodeURIComponent(slug)}`, data)
    return res.data
  },

  // PATCH /api/GameRooms/{slug}/activate
  activate: async (slug: string) => {
    return await api.patch(`${ENDPOINT}/${encodeURIComponent(slug)}/activate`)
  },

  // PATCH /api/GameRooms/{slug}/deactivate
  deactivate: async (slug: string) => {
    return await api.patch(`${ENDPOINT}/${encodeURIComponent(slug)}/deactivate`)
  },
  
  // PATCH /api/GameRooms/{slug}/maintenance
  setMaintenance: async (slug: string) => {
    return await api.patch(`${ENDPOINT}/${encodeURIComponent(slug)}/maintenance`)
  },

  // DELETE /api/GameRooms/{slug} - Eliminación física de la sala
  delete: async (slug: string) => {
    return await api.delete(`${ENDPOINT}/${encodeURIComponent(slug)}`)
  },
}