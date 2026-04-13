import { useState } from 'react'
import { Bell } from 'lucide-react'
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

// ─── NotificationBell ────────────────────────────────────────────────────────

export function NotificationBell() {
  const [open, setOpen] = useState(false)

  // Polling cada 10s — se activa al abrir el popover y sigue en background
  const { notifications, loading } = useNotifications(undefined, 10_000)

  const pendingCount  = notifications.filter(n => n.status === 'pending' || n.status === 'processing').length
  const hasPending    = pendingCount > 0
  const recent        = notifications.slice(0, 8) // mostrar las 8 más recientes

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label={hasPending ? `${pendingCount} notificaciones pendientes` : 'Notificaciones'}
        >
          <Bell className="w-5 h-5" />

          {/* Badge rojo con contador */}
          {hasPending && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
              <span className="absolute inline-flex h-3.5 w-3.5 rounded-full bg-red-500 opacity-75 animate-ping" />
              <span className="relative inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold leading-none">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            </span>
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
          {hasPending && (
            <span className="text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded-full">
              {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
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
