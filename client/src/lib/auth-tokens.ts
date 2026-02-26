import type { AuthUser } from '@/src/services/auth.service'
import { authStore } from './auth-store'


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


export function getRefreshToken(): string | null {
  return null
}

// export function setRefreshToken(token: string) {
//   // El refresh token se maneja mediante cookie en el backend
//   // Esta función ya no hace nada pero se mantiene por compatibilidad
// }

// export function clearRefreshToken() {
//   // El refresh token se limpia mediante el endpoint /auth/logout
//   // Esta función ya no hace nada pero se mantiene por compatibilidad
// }

export function getUser(): AuthUser | null {
  return authStore.getUser()
}

export function setUser(user: AuthUser | null) {
  authStore.setUser(user)
}

export function clearTokens() {
  authStore.clear()
}

