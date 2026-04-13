import { useState, useEffect, useCallback, useRef } from 'react'
import {
  notificationsService,
  type Notification,
  type NotificationStatus,
  type GatewayStatus,
  type EnqueueRequest,
  type EnqueueResponse,
} from '@/src/services/notifications.service'

// ─── useNotifications ────────────────────────────────────────────────────────
/**
 * Lista de notificaciones con polling automático cada `pollInterval` ms.
 * Si `pollInterval` es 0 no hace polling (solo carga inicial).
 */
export function useNotifications(
  status?: NotificationStatus,
  pollInterval = 0,
) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await notificationsService.getAll(status)
      setNotifications(data.notifications)
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { error?: string; detail?: string } }; message?: string }
      const msg =
        ax.response?.data?.error
        ?? ax.response?.data?.detail
        ?? (ax.response?.status === 401
          ? 'No autorizado (revisa JWT_SECRET en el gateway de notificaciones).'
          : ax.message === 'Network Error'
            ? 'No hay conexión con el gateway (revisa que el servidor Node esté en marcha y VITE_NOTIFICATIONS_URL).'
            : 'Error al cargar notificaciones.')
      setError(String(msg))
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    fetchNotifications()

    if (pollInterval > 0) {
      intervalRef.current = setInterval(fetchNotifications, pollInterval)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchNotifications, pollInterval])

  return { notifications, loading, error, refetch: fetchNotifications }
}

// ─── useGatewayStatus ────────────────────────────────────────────────────────
/**
 * Estado del gateway IA (proveedores activos, cola, etc).
 * No requiere JWT — endpoint público.
 */
export function useGatewayStatus() {
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await notificationsService.getStatus()
      setGatewayStatus(data)
    } catch {
      setError('No se pudo conectar con el gateway de notificaciones.')
      setGatewayStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return { gatewayStatus, loading, error, refetch: fetchStatus }
}

// ─── useEnqueueNotification ──────────────────────────────────────────────────
/**
 * Encola una nueva notificación y devuelve la respuesta con urgencia y ID.
 */
export function useEnqueueNotification() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EnqueueResponse | null>(null)

  const enqueue = useCallback(async (data: EnqueueRequest) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await notificationsService.enqueue(data)
      setResult(response)
      return response
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Error al encolar la notificación.'
      setError(String(msg))
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { enqueue, loading, error, result }
}
