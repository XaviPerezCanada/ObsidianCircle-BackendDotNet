import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@/src/services/auth.service'
import { authService } from '@/src/services/auth.service'
import { authStore } from '@/src/lib/auth-store'
import { toast } from '@/components/ui/use-toast'

type AuthState = {
  accessToken: string | null
  user: AuthUser | null
}

type AuthContextValue = AuthState & {
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<AuthResponse>
  register: (data: RegisterRequest) => Promise<AuthResponse>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function extractTokens(payload: AuthResponse): {
  accessToken?: string
  refreshToken?: string
} {
  // Soportamos backends que devuelven {accessToken} o {token}
  const accessToken = payload.accessToken ?? payload.token
  return {
    accessToken,
    refreshToken: payload.refreshToken,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado inicial vacío - no se usa localStorage
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    user: null,
  })
  const [isInitialized, setIsInitialized] = useState(false)

  // Al montar (incluye F5): llamar a /auth/refresh, guardar accessToken en memoria y poner user en el Context
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await authService.refresh()
        const { accessToken, user } = res.data ?? {}
        
        if (accessToken && user) {
          // Guardar en store en memoria (no localStorage)
          authStore.setAccessToken(accessToken)
          authStore.setUser(user)
          setState({ accessToken, user })
        } else {
          // Si no hay datos, limpiar
          authStore.clear()
          setState({ accessToken: null, user: null })
        }
      } catch (error) {
        // Si falla el refresh (no hay cookie o expiró), limpiar estado
        authStore.clear()
        setState({ accessToken: null, user: null })
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [])

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Continuar con el logout aunque falle la llamada al backend
      console.error('Error al cerrar sesión en el backend:', error)
    }
    // Limpiar store en memoria (no localStorage)
    authStore.clear()
    setState({ accessToken: null, user: null })
    toast({
      title: 'Sesión cerrada',
      description: 'Cerraste sesión correctamente',
    })
  }

  const login = async (data: LoginRequest) => {
    const res = await authService.login(data)
    const tokens = extractTokens(res.data ?? {})
    const user = res.data?.user ?? null
    
    // Guardar en store en memoria (no localStorage)
    // El refreshToken viene en cookie, no en el body
    if (tokens.accessToken) {
      authStore.setAccessToken(tokens.accessToken)
    }
    if (user) {
      authStore.setUser(user)
    }
    
    setState({ accessToken: tokens.accessToken ?? null, user })
    return res.data
  }

  const register = async (data: RegisterRequest) => {
    const res = await authService.register(data)
    const tokens = extractTokens(res.data ?? {})
    const user = res.data?.user ?? null
    
    // Guardar en store en memoria (no localStorage)
    // El refreshToken viene en cookie, no en el body
    if (tokens.accessToken) {
      authStore.setAccessToken(tokens.accessToken)
    }
    if (user) {
      authStore.setUser(user)
    }
    
    setState({ accessToken: tokens.accessToken ?? null, user })
    return res.data
  }

  const refreshUser = async () => {
    try {
      const res = await authService.refresh()
      const { accessToken, user } = res.data ?? {}
      
      if (accessToken && user) {
        authStore.setAccessToken(accessToken)
        authStore.setUser(user)
        setState({ accessToken, user })
      }
    } catch (error) {
      console.error('Error al refrescar usuario:', error)
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: state.accessToken,
      user: state.user,
      isAuthenticated: Boolean(state.accessToken),
      login,
      register,
      logout,
      refreshUser,
    }),
    [state.accessToken, state.user],
  )

  // No renderizar hasta que se haya intentado inicializar la autenticación
  if (!isInitialized) {
    return null // o un componente de loading si prefieres
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  console.log(ctx)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

