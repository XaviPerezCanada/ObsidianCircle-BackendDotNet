import { useEffect, useState } from 'react'
import { juegoService, type Juego, type CreateJuegoRequest } from '@/src/services/juego.service'
import { useAuth } from '@/src/context/auth-context'

type UseMyBoardGamesState = {
  games: Juego[]
  loading: boolean
  error: string | null
}

// Datos mínimos que el formulario necesita pasar al hook
export type NewBoardGameFormData = {
  titulo: string
  descripcion?: string
  tipo?: 'MESA' | 'ROL'
  jugadoresMin: number
  jugadoresMax: number
  edadMinima?: number
  duracionMin?: number
  sistema?: string
  ambientacion?: string
  nivelInicial?: number
  estado?: 'ACTIVO' | 'INACTIVO'
}

export function useMyBoardGames(enabled: boolean = true) {
  const { user } = useAuth()

  const [state, setState] = useState<UseMyBoardGamesState>({
    games: [],
    loading: enabled,
    error: null,
  })

  const loadMyGames = async () => {
    if (!enabled) return
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const games = await juegoService.getMyGamesFromProfile()
      setState({ games, loading: false, error: null })
    } catch (err: any) {
      const backendDetail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'No se pudieron cargar tus juegos.'

      setState(prev => ({ ...prev, loading: false, error: backendDetail }))
    }
  }

  const addGame = async (data: NewBoardGameFormData) => {
    const socio = user?.username || user?.slug || user?.email
    if (!socio) {
      throw new Error('No se pudo determinar el socio. Inicia sesión de nuevo.')
    }

    const payload: CreateJuegoRequest = {
      Titulo: data.titulo.trim(),
      Socio: socio,
      JugadoresMin: data.jugadoresMin,
      JugadoresMax: data.jugadoresMax,
      descripcion: data.descripcion?.trim() || undefined,
      tipo: data.tipo,
      edad_minima: data.edadMinima,
      duracion_min: data.duracionMin,
      sistema: data.sistema?.trim() || undefined,
      ambientacion: data.ambientacion?.trim() || undefined,
      nivel_inicial: data.nivelInicial,
      estado: data.estado,
    }

    const created = await juegoService.create(payload)

    // Actualizamos el estado local para que el nuevo juego aparezca sin recargar
    setState(prev => ({
      ...prev,
      games: [...prev.games, created.data ?? (created as any)], // por compatibilidad si api devuelve .data
    }))

    return created
  }

  useEffect(() => {
    void loadMyGames()
  }, [enabled])

  return {
    games: state.games,
    loading: state.loading,
    error: state.error,
    reload: loadMyGames,
    addGame,
  }
}

