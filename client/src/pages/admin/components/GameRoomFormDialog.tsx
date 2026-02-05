import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import type { GameRoom, CreateGameRoomRequest, UpdateGameRoomRequest } from '@/src/services/sala.service'
import { gameRoomCommands } from '../command/commandGameRooms'
import { gameRoomQueries } from '../queries/queriesGameRooms'
import { toast } from '@/src/hooks/use-toast'

interface GameRoomFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: GameRoom | null
  onSuccess: () => void
}

export function GameRoomFormDialog({ open, onOpenChange, room, onSuccess }: GameRoomFormDialogProps) {
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState<number>(10)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const isEditMode = !!room

  // Cargar datos de la sala cuando se abre en modo edición
  useEffect(() => {
    if (open && room) {
      setName(room.name)
      setCapacity(room.capacity)
      setDescription(room.description || '')
    } else if (open && !room) {
      // Resetear formulario para crear nueva sala
      setName('')
      setCapacity(10)
      setDescription('')
    }
  }, [open, room])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es requerido',
        variant: 'destructive'
      })
      return
    }

    if (capacity <= 0) {
      toast({
        title: 'Error',
        description: 'La capacidad debe ser mayor a 0',
        variant: 'destructive'
      })
      return
    }

    // Validar que el nombre sea único
    const trimmedName = name.trim()
    const nameExists = await gameRoomQueries.checkNameExists(
      trimmedName,
      isEditMode && room ? room.slug : undefined
    )

    if (nameExists) {
      toast({
        title: 'Error',
        description: `Ya existe una sala con el nombre "${trimmedName}". Por favor, elige otro nombre.`,
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      if (isEditMode && room) {
        await gameRoomCommands.update(room.slug, {
          name: trimmedName,
          capacity,
          description: description.trim()
        })
        toast({
          title: 'Éxito',
          description: 'Sala actualizada correctamente'
        })
      } else {
        await gameRoomCommands.create({
          name: trimmedName,
          capacity,
          description: description.trim()
        })
        toast({
          title: 'Éxito',
          description: 'Sala creada correctamente'
        })
      }
      
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      // El backend también validará, pero mostramos el error del servidor si viene
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Error al guardar la sala'
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Sala' : 'Crear Nueva Sala'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Sala Principal"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacidad *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
              placeholder="10"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la sala..."
              rows={3}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
