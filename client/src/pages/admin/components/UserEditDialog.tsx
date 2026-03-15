'use client'

import { useEffect, useMemo, useState } from 'react'
import { userService, type AdminUserListItem } from '@/src/services/user.service'
import { toast } from '@/src/hooks/use-toast'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Switch } from '@/src/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUserListItem | null
  onSuccess: () => void | Promise<void>
}

const ROLE_OPTIONS = [
  { value: 'BASICO', label: 'BÁSICO' },
  { value: 'SOCIO', label: 'SOCIO' },
  { value: 'ADMIN', label: 'ADMIN' },
] as const

export function UserEditDialog({ open, onOpenChange, user, onSuccess }: Props) {
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState<'BASICO' | 'SOCIO' | 'ADMIN'>('BASICO')
  const [active, setActive] = useState(true)

  const normalizedActive = useMemo(() => {
    const v = (user?.status ?? '').toString().toLowerCase()
    return v === 'active'
  }, [user?.status])

  useEffect(() => {
    if (!open) return
    if (!user) return
    setUsername(user.username ?? '')
    setEmail(user.email ?? '')
    setType((user.type as any) ?? 'BASICO')
    setActive(normalizedActive)
  }, [open, user, normalizedActive])

  const canSave = Boolean(user?.slug) && username.trim().length > 0 && email.trim().length > 0

  const handleSave = async () => {
    if (!user) return
    if (!canSave) return

    setSaving(true)
    try {
      await userService.updateAdmin(user.slug, {
        username: username.trim(),
        email: email.trim(),
        type,
        active,
      })

      toast({
        title: 'Usuario actualizado',
        description: `Se guardaron los cambios de "${user.slug}".`,
      })

      onOpenChange(false)
      await onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || error?.message || 'Error al actualizar el usuario',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Actualiza los datos y permisos del usuario seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Nombre de usuario</div>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Rol</div>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Activo</div>
              <div className="text-xs text-muted-foreground">
                Si está desactivado no podrá iniciar sesión.
              </div>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!canSave || saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

