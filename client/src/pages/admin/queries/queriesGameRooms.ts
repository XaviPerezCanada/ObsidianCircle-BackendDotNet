import { gameRoomService, type GameRoom } from '@/src/services/sala.service'

/**
 * Queries para GameRooms - Operaciones de lectura (CQRS)
 * Estas funciones solo leen datos, no modifican el estado
 */

export const gameRoomQueries = {
  /**
   * Obtiene todas las salas
   */
  getAll: async (): Promise<GameRoom[]> => {
    try {
      return await gameRoomService.getAll()
    } catch (error: any) {
      console.error('Error en query getAll:', error)
      throw error
    }
  },

  /**
   * Obtiene solo las salas disponibles (activas o en mantenimiento)
   */
  getAvailable: async (): Promise<GameRoom[]> => {
    try {
      return await gameRoomService.getAvailable()
    } catch (error: any) {
      console.error('Error en query getAvailable:', error)
      throw error
    }
  },

  /**
   * Obtiene una sala específica por su slug
   */
  getBySlug: async (slug: string): Promise<GameRoom> => {
    try {
      if (!slug) {
        throw new Error('Slug es requerido')
      }
      return await gameRoomService.getBySlug(slug)
    } catch (error: any) {
      console.error('Error en query getBySlug:', error)
      throw error
    }
  },

  /**
   * Filtra las salas según un término de búsqueda
   */
  filter: (rooms: GameRoom[], searchTerm: string): GameRoom[] => {
    if (!searchTerm) return rooms
    
    const term = searchTerm.toLowerCase()
    return rooms.filter((room) => {
      return (
        room.name?.toLowerCase().includes(term) ||
        room.slug?.toLowerCase().includes(term) ||
        room.description?.toLowerCase().includes(term) ||
        room.capacity?.toString().includes(term) ||
        room.status?.toLowerCase().includes(term)
      )
    })
  },

  /**
   * Obtiene estadísticas de las salas
   */
  getStatistics: (rooms: GameRoom[]) => {
    return {
      total: rooms.length,
      active: rooms.filter(r => r.status === 'Active').length,
      inactive: rooms.filter(r => r.status === 'Inactive').length,
      underMaintenance: rooms.filter(r => r.status === 'UnderMaintenance').length,
    }
  },

  /**
   * Verifica si existe una sala con el nombre dado
   * @param name Nombre a verificar
   * @param excludeSlug Slug a excluir de la búsqueda (útil para edición)
   * @returns true si existe una sala con ese nombre, false en caso contrario
   */
  checkNameExists: async (name: string, excludeSlug?: string): Promise<boolean> => {
    try {
      if (!name || !name.trim()) {
        return false
      }
      
      const rooms = await gameRoomService.getAll()
      const normalizedName = name.trim().toLowerCase()
      
      return rooms.some(room => {
        const roomNameNormalized = room.name?.toLowerCase().trim()
        // Si estamos editando, excluimos la sala actual
        if (excludeSlug && room.slug === excludeSlug) {
          return false
        }
        return roomNameNormalized === normalizedName
      })
    } catch (error: any) {
      console.error('Error en query checkNameExists:', error)
      // En caso de error, retornamos false para no bloquear la creación
      return false
    }
  }
}
