import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@/src/services/auth.service'
import { authService } from '@/src/services/auth.service'
import { authStore } from '@/src/lib/auth-store'
import { AUTH_SESSION_INVALID_EVENT } from '@/src/lib/api'
import { toast } from '@/src/hooks/use-toast'

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

function normalizeAuthUser(input: AuthUser | undefined | null): AuthUser | null {
  if (!input) return null
  const username = input.username ?? input.name
  return {
    ...input,
    username,
    name: input.name ?? username,
    tipo: input.tipo ?? input.type,
    type: input.type ?? input.tipo,
  }
}

// Dedupe global del refresh inicial (evita doble llamada en React 18 StrictMode dev)
let initialRefreshPromise: Promise<{ accessToken?: string; user?: AuthUser | null } | null> | null = null

async function refreshOnceOnStartup() {
  if (!initialRefreshPromise) {
    initialRefreshPromise = authService
      .refresh()
      .then((res) => {
        const data = res.data ?? null
        if (!data) return null
        return {
          ...data,
          user: normalizeAuthUser(data.user),
        }
      })
      .catch((err) => {
        initialRefreshPromise = null
        throw err
      })
  }
  return initialRefreshPromise
}

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
  // Estado inicial vac?o - no se usa localStorage
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    user: null,
  })
  const [isInitialized, setIsInitialized] = useState(false)

  // Cuando el backend devuelve 401 (otro dispositivo, sesi?n inv?lida): actualizar estado y avisar al usuario
  useEffect(() => {
    const handleSessionInvalid = () => {
      setState({ accessToken: null, user: null })
      toast({
        title: 'Sesi?n no v?lida',
        description: 'Has iniciado sesi?n en otro dispositivo o tu sesi?n ha expirado. Inicia sesi?n de nuevo.',
        variant: 'destructive',
      })
    }
    window.addEventListener(AUTH_SESSION_INVALID_EVENT, handleSessionInvalid)
    return () => window.removeEventListener(AUTH_SESSION_INVALID_EVENT, handleSessionInvalid)
  }, [])

  // Al montar (incluye F5): llamar a /auth/refresh, guardar accessToken en memoria y poner user en el Context
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const data = await refreshOnceOnStartup()
        const { accessToken, user } = data ?? {}
        
        if (accessToken && user) {
          
          authStore.setAccessToken(accessToken)
          authStore.setUser(user)
          setState({ accessToken, user })
        } else {
        
          // Si no hay cookie/sesi?n, limpiar estado
          authStore.clear()
          setState({ accessToken: null, user: null })
        }
      } catch (error) {
        // Si falla el refresh inicial pero YA ten?amos sesi?n en memoria, no la tires.
        // (esto cubre casos raros de doble refresh/rotaci?n en dev)
        const existingToken = authStore.getAccessToken()
        const existingUser = authStore.getUser()
        if (existingToken && existingUser) {
          setState({ accessToken: existingToken, user: existingUser })
        } else {
          authStore.clear()
          setState({ accessToken: null, user: null })
        }
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
      console.error('Error al cerrar sesi?n en el backend:', error)
    }
    // Limpiar store en memoria (no localStorage)
    authStore.clear()
    setState({ accessToken: null, user: null })
    toast({
      title: 'Sesi?n cerrada',
      description: 'Cerraste sesi?n correctamente',
    })
  }

  const login = async (data: LoginRequest) => {
    const res = await authService.login(data)
    console.log('LOGIN res.data =>', res.data) 
    const tokens = extractTokens(res.data ?? {})
    console.log('LOGIN tokens.accessToken =', tokens.accessToken)
    const user = normalizeAuthUser(res.data?.user)
    
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
    const user = normalizeAuthUser(res.data?.user)
    
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
      const accessToken = res.data?.accessToken
      const user = normalizeAuthUser(res.data?.user)
      
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

  // No renderizar hasta que se haya intentado inicializar la autenticaci?n
  if (!isInitialized) {
    return null // o un componente de loading si prefieres
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

