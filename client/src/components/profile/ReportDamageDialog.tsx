import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Textarea } from '@/src/components/ui/textarea'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Label } from '@/src/components/ui/label'
import { useEnqueueNotification } from '@/src/hooks/useNotifications'
import { toast } from '@/src/hooks/use-toast'
import type { Reserva } from '@/src/services/reservation.service'
import type { Juego } from '@/src/services/juego.service'
import { useAuth } from '@/src/context/auth-context'

export interface ReportDamageDialogProps {
  isOpen: boolean
  onClose: () => void
  reserva: Reserva
  juego: Juego
}

export function ReportDamageDialog({ isOpen, onClose, reserva, juego }: ReportDamageDialogProps) {
  const { user } = useAuth()
  const { enqueue, loading } = useEnqueueNotification()
  const [description, setDescription] = useState('')
  const [channels, setChannels] = useState<('WhatsApp' | 'Email' | 'SMS')[]>(['WhatsApp', 'Email'])

  const handleToggleChannel = (channel: 'WhatsApp' | 'Email' | 'SMS') => {
    setChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (description.length < 20) {
      toast({
        title: 'Descripción muy corta',
        description: 'Por favor, da más detalles sobre el desperfecto.',
        variant: 'destructive',
      })
      return
    }

    if (channels.length === 0) {
      toast({
        title: 'Sin canales',
        description: 'Selecciona al menos un canal para notificar al socio.',
        variant: 'destructive',
      })
      return
    }

    const task_description = `El usuario ${user?.username ?? 'Un usuario'} reporta desperfectos en el juego '${juego.titulo}' reservado el ${reserva.fecha}. Descripción: '${description}'.`

    const res = await enqueue({
      task_description,
      channels,
      tone: 'Preocupado pero amable y constructivo',
      data: {
        usuario: user?.username,
        propietario: juego.socio,
        juego: juego.titulo,
        juego_id: juego.id,
        fecha_reserva: reserva.fecha,
        franja: reserva.franja_id,
        descripcion: description,
      },
    })

    if (res) {
      toast({
        title: 'Notificación enviada',
        description: `El socio ha sido notificado (Urgencia detectada: ${res.urgency}).`,
      })
      setDescription('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-md shadow-xl border-border">
        <DialogHeader>
          <DialogTitle>Reportar desperfecto</DialogTitle>
          <DialogDescription>
            Notifica al socio <strong>{juego.socio}</strong> sobre problemas con el juego <strong>{juego.titulo}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="description">¿Qué problema tiene el juego?</Label>
            <Textarea
              id="description"
              placeholder="Ej: Le faltan 3 fichas de recursos y hay una carta manchada..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="resize-none h-24"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo 20 caracteres. Da todos los detalles posibles.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Canales de notificación</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={channels.includes('WhatsApp')}
                  onCheckedChange={() => handleToggleChannel('WhatsApp')}
                  disabled={loading}
                />
                <label htmlFor="whatsapp" className="text-sm cursor-pointer">WhatsApp</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={channels.includes('Email')}
                  onCheckedChange={() => handleToggleChannel('Email')}
                  disabled={loading}
                />
                <label htmlFor="email" className="text-sm cursor-pointer">Email</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms"
                  checked={channels.includes('SMS')}
                  onCheckedChange={() => handleToggleChannel('SMS')}
                  disabled={loading}
                />
                <label htmlFor="sms" className="text-sm cursor-pointer">SMS</label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar notificación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
