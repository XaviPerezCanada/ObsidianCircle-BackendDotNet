import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '@/src/context/auth-context'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover'
import { Button } from '@/src/components/ui/button'
import { useNotifications } from '@/src/hooks/useNotifications'
import type { Notification, NotificationUrgency } from '@/src/services/notifications.service'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const URGENCY_CONFIG: Record<NotificationUrgency, { label: string; dot: string; badge: string }> = {
  low:      { label: 'Baja',     dot: 'bg-green-500',  badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  medium:   { label: 'Media',    dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  high:     { label: 'Alta',     dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  critical: { label: 'Crítica',  dot: 'bg-red-500',    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
}

const STATUS_LABEL: Record<string, string> = {
  pending:    '⏳ Pendiente',
  processing: '⚙️ Procesando',
  processed:  '✅ Enviada',
  failed:     '❌ Fallida',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'ahora mismo'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

function NotificationItem({ n }: { n: Notification }) {
  const urgency = URGENCY_CONFIG[n.urgency] ?? URGENCY_CONFIG.medium
  const channels = Array.isArray(n.channels) ? n.channels : []

  return (
    <div className="flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
      {/* Dot de urgencia */}
      <div className="mt-1.5 flex-shrink-0">
        <span className={`block w-2 h-2 rounded-full ${urgency.dot}`} />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug line-clamp-2">
          {n.task_description}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${urgency.badge}`}>
            {urgency.label}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {STATUS_LABEL[n.status] ?? n.status}
          </span>
          {channels.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              · {channels.join(', ')}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground ml-auto">
            {timeAgo(n.created_at)}
          </span>
        </div>
      </div>
    </div>
  )
}

/** Cola real (siempre cuenta) o procesadas aún no vistas (creación posterior a “última lectura”). */
function needsNavbarAttention(n: Notification, lastSeenMs: number): boolean {
  const s = n.status
  if (s === 'pending' || s === 'processing' || s === 'failed') return true
  if (s === 'processed') {
    return new Date(n.created_at).getTime() > lastSeenMs
  }
  return false
}

function readLastSeenMs(storageKey: string): number {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return 0
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

// ─── NotificationBell ────────────────────────────────────────────────────────

export function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const lastSeenStorageKey = useMemo(
    () => `notifications_last_seen_ms_${user?.username ?? 'anon'}`,
    [user?.username],
  )

  const [lastSeenMs, setLastSeenMs] = useState(0)

  useEffect(() => {
    setLastSeenMs(readLastSeenMs(lastSeenStorageKey))
  }, [lastSeenStorageKey])

  const markNotificationsSeen = useCallback(() => {
    const t = Date.now()
    setLastSeenMs(t)
    try {
      localStorage.setItem(lastSeenStorageKey, String(t))
    } catch {
      /* ignore quota */
    }
  }, [lastSeenStorageKey])

  // Polling frecuente para ver pending/processing antes de que el worker termine (intervalo típico 5s)
  const { notifications, loading, error } = useNotifications(undefined, 3_000)

  const attentionCount = notifications.filter((n) => needsNavbarAttention(n, lastSeenMs)).length
  const hasAttention = attentionCount > 0
  const recent = notifications.slice(0, 8)

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (next) markNotificationsSeen()
    },
    [markNotificationsSeen],
  )

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label={
            error
              ? 'Error al cargar notificaciones'
              : hasAttention
                ? `${attentionCount} notificaciones`
                : 'Notificaciones'
          }
          title={error ?? undefined}
        >
          <Bell className="w-5 h-5" />

          {/* Badge rojo con contador (cola + procesadas recientes) */}
          {hasAttention && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
              <span className="absolute inline-flex h-3.5 w-3.5 rounded-full bg-red-500 opacity-75 animate-ping" />
              <span className="relative inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold leading-none">
                {attentionCount > 9 ? '9+' : attentionCount}
              </span>
            </span>
          )}

          {error && !hasAttention && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500" title={error} />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 shadow-xl border-border/60"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <span className="text-sm font-semibold text-foreground">Notificaciones</span>
          {error && (
            <span className="text-xs text-amber-600 dark:text-amber-400 max-w-[200px] truncate" title={error}>
              Sin conexión al servicio
            </span>
          )}
          {hasAttention && !error && (
            <span className="text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded-full">
              {attentionCount} sin leer
            </span>
          )}
        </div>

        {/* Lista */}
        <div className="max-h-80 overflow-y-auto">
          {loading && recent.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Cargando…
            </div>
          )}

          {!loading && recent.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Sin notificaciones</p>
            </div>
          )}

          {recent.map(n => (
            <NotificationItem key={n.id} n={n} />
          ))}
        </div>

        {/* Footer */}
        {notifications.length > 8 && (
          <div className="px-4 py-2 border-t border-border/60 text-center">
            <span className="text-xs text-muted-foreground">
              +{notifications.length - 8} notificaciones más
            </span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
