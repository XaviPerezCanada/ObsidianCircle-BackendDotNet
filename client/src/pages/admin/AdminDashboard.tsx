import { useEffect, useState } from 'react'
import { useDashboard } from '@/src/hooks/useDashboard'
import { useAuth } from "@/src/context/auth-context";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { Footer } from '@/src/components/layout/footer'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Edit, 
  MoreVertical, 
  Power, 
  PowerOff, 
  Wrench, 
  Trash2, 
  Plus,
  AlertTriangle
} from 'lucide-react'
import { gameRoomCommands } from '@/src/pages/admin/command/commandGameRooms'
// import { gameRoomQueries } from '@/src/pages/admin/queries/queriesGameRooms'
import { GameRoomFormDialog } from './components/GameRoomFormDialog'
import type { GameRoom } from '@/src/services/sala.service'
import { toast } from '@/src/hooks/use-toast'
// Importar comandos de prueba (disponibles en consola como testGameRooms)
import '@/src/pages/admin/command/commandGameRooms'

export function AdminDashboard() {
  useAuth()
  const {
    activeTab,
    setActiveTab,
    users,
    gameRooms,
    reservas,
    loading,
    error,
    search,
    setSearch,
    loadAll,
  } = useDashboard()

  // Estados para el diálogo de edición/creación
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<GameRoom | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    void loadAll()
  }, [])

  const user = useAuth()

  // Handlers para acciones de salas
  const handleEdit = (room: GameRoom) => {
    setSelectedRoom(room)
    setEditDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedRoom(null)
    setEditDialogOpen(true)
  }

  const handleActivate = async (room: GameRoom) => {
    setActionLoading(true)
    try {
      await gameRoomCommands.activate(room.slug)
      toast({
        title: 'Éxito',
        description: `Sala "${room.name}" activada correctamente`
      })
      await loadAll()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Error al activar la sala',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeactivate = async (room: GameRoom) => {
    setActionLoading(true)
    try {
      await gameRoomCommands.deactivate(room.slug)
      toast({
        title: 'Éxito',
        description: `Sala "${room.name}" desactivada correctamente`
      })
      await loadAll()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Error al desactivar la sala',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSetMaintenance = async (room: GameRoom) => {
    setActionLoading(true)
    try {
      await gameRoomCommands.setMaintenance(room.slug)
      toast({
        title: 'Éxito',
        description: `Sala "${room.name}" puesta en mantenimiento`
      })
      await loadAll()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Error al poner en mantenimiento',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteClick = (room: GameRoom) => {
    setRoomToDelete(room)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return
    
    setActionLoading(true)
    try {
      await gameRoomCommands.delete(roomToDelete.slug)
      toast({
        title: 'Éxito',
        description: `Sala "${roomToDelete.name}" eliminada correctamente`
      })
      setDeleteDialogOpen(false)
      setRoomToDelete(null)
      await loadAll()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Error al eliminar la sala',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (user?.user?.tipo === 'ADMIN') {
    return (
      <>
      <main className="min-h-screen bg-background flex items-center justify-center px-6 pt-24 pb-24">
        <div className="max-w-md w-full rounded-xl mx-auto text-center border border-border bg-card/50 backdrop-blur-sm p-6 text-foreground">
          <h2 className="text-xl font-semibold">Acceso restringido</h2>
          <p className="text-muted-foreground mt-2">
            Necesitas permisos de administrador para ver este panel.
          </p>
        </div>
      </main>
      <Footer />
      </>
    )
  }
  if(user?.user?.tipo !== 'BASICO' && user?.user?.tipo !== 'SOCIO'){
  return (
    <>
    <main className="min-h-screen bg-background px-6 pt-24 pb-24 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/Admin.png')" }}>
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6 bg-card/65 backdrop-blur-sm border-border rounded-xl"  >
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Panel de administración
            </h1>
            <p className="text-muted-foreground text-sm">
              Gestiona usuarios, salas y reservas de Obsidian Circle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Buscar por nombre, email, slug, fecha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearch('')
                void loadAll()
              }}
            >
              ⟳
            </Button>
          </div>
        </header>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="w-4 h-4" />
            Cargando datos del dashboard...
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive border border-destructive/40 bg-destructive/5 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="gameRooms">Game Rooms</TabsTrigger>
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
            <TabsTrigger value="planes">Planes</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="mt-4 space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.nombre}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="font-mono text-xs">{u.slug}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={u.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-600'}>
                        {u.status === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Total usuarios: {users.length}</TableCaption>
              <TableCaption>
                <Button className="w-fit">Crear usuario</Button>
              </TableCaption>
            </Table>
          </TabsContent>

          <TabsContent value="gameRooms" className="mt-4 space-y-2">
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground mb-2">
                Debug: {gameRooms.length} salas cargadas | Búsqueda: "{search}"
              </div>
            )}
            
            {gameRooms.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                No hay salas disponibles. {error && <span className="text-destructive">Error: {error}</span>}
              </div>
            )}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody> 
                {gameRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {loading ? 'Cargando...' : 'No hay salas para mostrar'}
                    </TableCell>
                  </TableRow>
                ) : (
                  gameRooms.map((gr) => (
                    <TableRow key={gr.slug || gr.id}>
                      <TableCell>{gr.name || '(Sin nombre)'}</TableCell>
                      <TableCell className="font-mono text-xs">{gr.slug || '(Sin slug)'}</TableCell>
                      <TableCell>{gr.capacity ?? 0}</TableCell>
                      <TableCell>
                        <Badge className={
                          gr.status === 'Active' 
                            ? 'bg-emerald-600' 
                            : gr.status === 'UnderMaintenance'
                              ? 'bg-amber-600'
                              : 'bg-slate-600'
                        }>
                          {gr.status === 'Active' ? 'ACTIVA' : gr.status === 'UnderMaintenance' ? 'MANTENIMIENTO' : 'INACTIVA'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{gr.description || '(Sin descripción)'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" disabled={actionLoading}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(gr)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {gr.status !== 'Active' && (
                              <DropdownMenuItem onClick={() => handleActivate(gr)}>
                                <Power className="w-4 h-4 mr-2" />
                                Activar
                              </DropdownMenuItem>
                            )}
                            {gr.status !== 'Inactive' && (
                              <DropdownMenuItem onClick={() => handleDeactivate(gr)}>
                                <PowerOff className="w-4 h-4 mr-2" />
                                Desactivar
                              </DropdownMenuItem>
                            )}
                            {gr.status !== 'UnderMaintenance' && (
                              <DropdownMenuItem onClick={() => handleSetMaintenance(gr)}>
                                <Wrench className="w-4 h-4 mr-2" />
                                Mantenimiento
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(gr)}
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableCaption>Total game rooms: {gameRooms.length}</TableCaption>
              <TableCaption>
                <Button className="w-fit" onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear sala
                </Button>
              </TableCaption>
            </Table>
          </TabsContent>

          <TabsContent value="reservas" className="mt-4 space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Sala ID</TableHead>
                  <TableHead>Usuario ID</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservas.map((r) => (
                  <TableRow key={r.id ?? r.slug}>
                    <TableCell className="font-mono text-xs">{r.slug}</TableCell>
                    <TableCell>{r.fecha}</TableCell>
                    <TableCell>{r.sala_id}</TableCell>
                    <TableCell>{r.usuario_id}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          r.estado === 'CONFIRMADA'
                            ? 'bg-emerald-600'
                            : r.estado === 'CANCELADA'
                              ? 'bg-destructive'
                              : 'bg-amber-600'
                        }
                      >
                        {r.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Total reservas: {reservas.length}</TableCaption>
              <TableCaption>
                <Button  className="w-fit">Crear reserva</Button>
              </TableCaption>
            </Table>
          </TabsContent>
          <TabsContent value="planes" className="mt-4 space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </TabsContent>
        </Tabs>
        
      </div>
    </main>
    <Footer />

    {/* Diálogo de crear/editar sala */}
    <GameRoomFormDialog
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      room={selectedRoom}
      onSuccess={loadAll}
    />

    {/* Diálogo de confirmación de eliminación */}
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Confirmar eliminación
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar la sala "{roomToDelete?.name}"?
            Esta acción no se puede deshacer y la sala será eliminada permanentemente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDeleteDialogOpen(false)
              setRoomToDelete(null)
            }}
            disabled={actionLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={actionLoading}
          >
            {actionLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
  }

  return null}