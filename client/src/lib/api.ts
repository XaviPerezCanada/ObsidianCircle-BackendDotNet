import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { authStore } from '@/src/lib/auth-store'

/**
 * Axios instance for API calls.
 * - Adds JWT access token to Authorization header.
 * - On 401, clears tokens (you can also trigger navigation in the AuthContext).
 * - Sends cookies with requests (needed for refresh_token cookie).
 * - Token se obtiene del store en memoria (no localStorage).
 */
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // <-- clave: envía cookies (refresh_token)
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStore.clear()
    }
    return Promise.reject(error)
  },
)

