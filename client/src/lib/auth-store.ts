/**
 * Store en memoria para el accessToken y user.
 * No usa localStorage, solo memoria durante la sesión del navegador.
 */
type AuthUser = {
  id: number
  name: string
  email: string
  tipo?: 'BASICO' | 'SOCIO' | 'ADMIN'
}

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
