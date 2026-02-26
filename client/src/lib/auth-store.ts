import type { AuthUser } from '@/src/services/auth.service'

/**
 * Store en memoria para el accessToken y user.
 * No usa localStorage, solo memoria durante la sesión del navegador.
 */

let accessToken: string | null = null
let user: AuthUser | null = null

export const authStore = {
  getAccessToken: (): string | null => accessToken,
  
  setAccessToken: (token: string | null): void => {
    accessToken = token
  },
  
  getUser: (): AuthUser | null => user,
  
  setUser: (userData: AuthUser | null): void => {
    user = userData
  },
  
  clear: (): void => {
    accessToken = null
    user = null
  },
}
