import type { AuthUser } from '@/src/services/auth.service'
import { authStore } from './auth-store'

/**
 * Funciones de compatibilidad que ahora usan el store en memoria.
 * NO usa localStorage - todo se guarda solo en memoria durante la sesión.
 * La persistencia real se hace mediante la cookie refresh_token del backend.
 */
export type AuthTokens = {
  accessToken: string
  refreshToken?: string
}

// Funciones que ahora usan el store en memoria en lugar de localStorage
export function getAccessToken(): string | null {
  return authStore.getAccessToken()
}

export function setAccessToken(token: string) {
  authStore.setAccessToken(token)
}

export function clearAccessToken() {
  authStore.setAccessToken(null)
}

// Refresh token ahora viene en cookie, estas funciones ya no se usan pero se mantienen por compatibilidad
export function getRefreshToken(): string | null {
  // El refresh token está en cookie httpOnly, no accesible desde JS
  return null
}

export function setRefreshToken(token: string) {
  // El refresh token se maneja mediante cookie en el backend
  // Esta función ya no hace nada pero se mantiene por compatibilidad
}

export function clearRefreshToken() {
  // El refresh token se limpia mediante el endpoint /auth/logout
  // Esta función ya no hace nada pero se mantiene por compatibilidad
}

export function getUser(): AuthUser | null {
  return authStore.getUser()
}

export function setUser(user: AuthUser | null) {
  authStore.setUser(user)
}

export function clearTokens() {
  authStore.clear()
}

