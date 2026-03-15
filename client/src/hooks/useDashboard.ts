import { useState, useEffect } from 'react'
import { userService, type AdminUserListItem } from '@/src/services/user.service'
import { type GameRoom } from '@/src/services/sala.service'
import { reservationService, type Reserva } from '@/src/services/reservation.service'
import { planService, type Plan } from '@/src/services/plan.service'
import { gameRoomQueries } from '@/src/pages/admin/queries/queriesGameRooms'

type DashboardTab = 'usuarios' | 'gameRooms' | 'reservas'

export function useDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('usuarios')
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [planes, setPlanes] = useState<Plan[]>([])

  const loadAll = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Iniciando carga de datos del dashboard...')
      
      // Cargar cada servicio por separado para mejor debugging
      const [u, s, r, p] = await Promise.allSettled([
        userService.getAllAdmin(),
        gameRoomQueries.getAll(), // Usar query en lugar del servicio directo
        reservationService.getAllAdmin(),
        planService.getAll(),
      ])
      
      // Procesar usuarios (GET /api/admin/users)
      if (u.status === 'fulfilled') {
        console.log('✅ Usuarios cargados:', u.value.length)
        setUsers(u.value)
      } else {
        console.error('❌ Error cargando usuarios:', u.reason)
        setUsers([])
        setError(prev => prev || `Usuarios: ${u.reason?.message ?? 'Error al cargar'}`)
      }
      
      // Procesar gameRooms usando queries
      if (s.status === 'fulfilled') {
        setGameRooms(s.value)
      } else {
        console.error('❌ Error cargando GameRooms:', s.reason)
        console.error('Detalles del error:', {
          message: s.reason?.message,
          response: s.reason?.response?.data,
          status: s.reason?.response?.status
        })
        setGameRooms([])
        setError(`Error al cargar salas: ${s.reason?.message || 'Error desconocido'}`)
      }
      
      // Procesar reservas
      if (r.status === 'fulfilled') {
        console.log('✅ Reservas cargadas:', r.value.length)
        setReservas(r.value)
      } else {
        console.error('❌ Error cargando reservas:', r.reason)
        setReservas([])
      }
      
      // Procesar planes
      if (p.status === 'fulfilled') {
        console.log('✅ Planes cargados:', p.value.length)
        setPlanes(p.value)
      } else {
        console.error('❌ Error cargando planes:', p.reason)
        setPlanes([])
      }
      
      console.log('✅ Carga de datos completada')
      console.log('📊 Estado final:', {
        users: u.status === 'fulfilled' ? u.value.length : 0,
        gameRooms: s.status === 'fulfilled' ? s.value.length : 0,
        reservas: r.status === 'fulfilled' ? r.value.length : 0,
        planes: p.status === 'fulfilled' ? p.value.length : 0
      })
      
    } catch (err: any) {
      console.error('❌ Error general cargando dashboard:', err)
      console.error('Error response:', err?.response)
      console.error('Error data:', err?.response?.data)
      
      const message =
        err?.response?.data?.message ??
        err?.message ??
        'Error al cargar datos del dashboard'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.slug.toLowerCase().includes(term) ||
      u.type.toLowerCase().includes(term)
    )
  })

  // Usar la query de filtrado en lugar de lógica inline
  const filteredGameRooms = gameRoomQueries.filter(gameRooms, search)
  
  // Debug: Log cuando cambian los gameRooms
  useEffect(() => {
    console.log('🔍 GameRooms en estado:', gameRooms)
    console.log('🔍 GameRooms filtrados:', filteredGameRooms)
  }, [gameRooms, filteredGameRooms])

  const filteredReservas = reservas.filter((r) => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      r.slug.toLowerCase().includes(term) ||
      r.fecha.toLowerCase().includes(term)
    )
  })
  const filteredPlanes = planes.filter((p) => { 
    if (!search) return true
    const term = search.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(term) ||
      p.slug.toLowerCase().includes(term) ||
      p.periodo.toLowerCase().includes(term) ||
      p.precio_cent.toString().includes(term)
    )
  })

  return {
    activeTab,
    setActiveTab,
    users: filteredUsers,
    rawUsers: users,
    gameRooms: filteredGameRooms,
    rawGameRooms: gameRooms,
    reservas: filteredReservas,
    rawReservas: reservas,
    planes: filteredPlanes,
    rawPlanes: planes,
    loading,
    error,
    search,
    setSearch,
    loadAll,
  }
}

