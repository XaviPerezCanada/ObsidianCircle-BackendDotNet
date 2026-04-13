// services/notifications.service.ts
// Backend Node: backend-notifications (PORT en .env, por defecto 3000 — ver .env.example)
// El token JWT se inyecta desde authStore; JWT_SECRET del gateway debe coincidir con la API .NET.
import axios, { type InternalAxiosRequestConfig } from 'axios'
import { authStore } from '@/src/lib/auth-store'

const NOTIFICATIONS_BASE =
  (import.meta.env.VITE_NOTIFICATIONS_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:3000'

// ─── Cliente axios dedicado al servicio de notificaciones ────────────────────
export const notificationsApi = axios.create({
  baseURL: NOTIFICATIONS_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Reutiliza el mismo token del authStore (compartido con .NET)
notificationsApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type NotificationStatus = 'pending' | 'processing' | 'processed' | 'failed'

export type NotificationUrgency = 'low' | 'medium' | 'high' | 'critical'

export interface Notification {
  id: number
  task_description: string
  channels: string[]
  tone: string
  data: Record<string, unknown>
  urgency: NotificationUrgency
  urgency_reason: string
  urgency_provider: string
  status: NotificationStatus
  error_log: string
  created_at: string
  processed_at: string | null
}

export interface EnqueueRequest {
  task_description: string
  channels: ('WhatsApp' | 'Email' | 'SMS')[]
  tone?: string
  data?: Record<string, unknown>
}

export interface EnqueueResponse {
  id: number
  status: 'pending'
  urgency: NotificationUrgency
  urgency_reason: string
  urgency_provider: string
  channels: string[]
  message: string
}

export interface GatewayStatus {
  status: 'ok'
  timestamp: string
  ai_gateway: {
    mode: 'live' | 'mock'
    active_providers: string[]
    total_providers_available: number
  }
  queue: {
    total: number
    pending: number
    processing: number
    processed: number
    failed: number
  }
  worker: { interval_ms: number }
}

// ─── Métodos del servicio ─────────────────────────────────────────────────────

export const notificationsService = {
  /** Health check del gateway (sin auth) */
  getStatus: async (): Promise<GatewayStatus> => {
    const res = await notificationsApi.get<GatewayStatus>('/status')
    return res.data
  },

  /** Encola una nueva notificación (requiere JWT) */
  enqueue: async (data: EnqueueRequest): Promise<EnqueueResponse> => {
    const res = await notificationsApi.post<EnqueueResponse>('/enqueue-notification', data)
    return res.data
  },

  /** Lista todas las notificaciones, opcionalmente filtradas por status (requiere JWT) */
  getAll: async (status?: NotificationStatus): Promise<{ count: number; notifications: Notification[] }> => {
    const params = status ? { status } : {}
    const res = await notificationsApi.get('/notifications', { params })
    return res.data
  },

  /** Obtiene una notificación por ID (requiere JWT) */
  getById: async (id: number): Promise<Notification> => {
    const res = await notificationsApi.get<Notification>(`/notifications/${id}`)
    return res.data
  },
}
