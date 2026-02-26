import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react'
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@/src/services/auth.service'
import { authService } from '@/src/services/auth.service'
import { authStore } from '@/src/lib/auth-store'
import { AUTH_SESSION_INVALID_EVENT } from '@/src/lib/api'
import { toast } from '@/src/components/ui/use-toast'

type AuthState = {
  accessToken: string | null
  user: AuthUser | null
}

type AuthContextValue = AuthState & {
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<AuthResponse | undefined>
  register: (data: RegisterRequest) => Promise<AuthResponse | undefined>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function extractTokens(payload: AuthResponse): {
  accessToken?: string
} {
  // Soportamos backends que devuelven {accessToken} o {token}
  const accessToken = payload.accessToken ?? payload.token
  return {
    accessToken,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    user: null,
  })
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const handleSessionInvalid = () => {
      setState({ accessToken: null, user: null })
      toast({
        title: 'Sesión no válida',
        description: 'Has iniciado sesión en otro dispositivo o tu sesión ha expirado. Inicia sesión de nuevo.',
        variant: 'destructive',
      })
    }
    window.addEventListener(AUTH_SESSION_INVALID_EVENT, handleSessionInvalid)
    return () => window.removeEventListener(AUTH_SESSION_INVALID_EVENT, handleSessionInvalid)
  }, [])

  // Al montar: intentar refrescar usando cookie + /Auth/refresh
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) {
      setIsInitialized(true)
      return
    }
    initializedRef.current = true
  
    const initializeAuth = async () => {
      try {
        const res = await authService.refresh()
        const tokens = extractTokens(res.data ?? {})
        const user = res.data?.user ?? null
  
        if (tokens.accessToken) authStore.setAccessToken(tokens.accessToken)
        if (user) authStore.setUser(user)
  
        setState({ accessToken: tokens.accessToken ?? null, user })
      } catch {
        authStore.clear()
        setState({ accessToken: null, user: null })
      } finally {
        setIsInitialized(true)
      }
    }
  
    void initializeAuth()
  }, [])

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Error al cerrar sesión en el backend:', error)
    }

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
      const tokens = extractTokens(res.data ?? {})
      const user = res.data?.user ?? null

      if (tokens.accessToken) {
        authStore.setAccessToken(tokens.accessToken)
      }
      if (user) {
        authStore.setUser(user)
      }

      setState({
        accessToken: tokens.accessToken ?? null,
        user: user ?? state.user,
      })
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

  if (!isInitialized) {
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}