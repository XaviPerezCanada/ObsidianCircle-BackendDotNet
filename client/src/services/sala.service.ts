import { api } from '@/src/lib/api'


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

// Endpoint base: el controller tiene [Route("api/[controller]")] que genera "api/GameRooms"
// .NET convierte el nombre del controller a camelCase en las rutas
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