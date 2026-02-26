import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { authStore } from '@/src/lib/auth-store'

const DEVICE_ID_KEY = 'device-id'

function getDeviceId() {
  if (typeof window === 'undefined') return 'server' // por si acaso SSR
  let id = window.localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    window.localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Header de dispositivo
  config.headers = config.headers ?? {}
  const deviceId = getDeviceId()
  config.headers['X-Device-Id'] = deviceId

  // Header Authorization
  const token = authStore.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/** Evento que se dispara cuando el backend devuelve 401 (sesión inválida, otro dispositivo, etc.) */
export const AUTH_SESSION_INVALID_EVENT = 'auth:session-invalid'

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? ''
      // Si falla el propio refresh, NO limpies sesión automáticamente:
      // en dev (React StrictMode) puede haber un doble refresh y el 2º falla por rotación.
      if (!url.includes('/Auth/refresh')) {
        authStore.clear()
        window.dispatchEvent(new CustomEvent(AUTH_SESSION_INVALID_EVENT))
      }
    }
    return Promise.reject(error)
  },
)

