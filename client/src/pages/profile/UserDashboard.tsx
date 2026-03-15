import { useAuth } from "@/src/context/auth-context";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/button";
import { AddArticle } from "@/src/components/profile/AddArticle";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/src/components/ui/card";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { useJuego } from "@/src/hooks/useJuego";
import { useMyReservations } from "@/src/hooks/useMyReservations";
import { reservationService, type TimeSlot } from "@/src/services/reservation.service";
import { Dice6, BookOpen, Calendar, Loader2 } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import type { Juego } from "@/src/services/juego.service";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { toast } from "@/src/hooks/use-toast";

const FRANJAS: { value: TimeSlot; label: string }[] = [
  { value: "Morning", label: "Mañana" },
  { value: "Afternoon", label: "Tarde" },
  { value: "Night", label: "Noche" },
  { value: "FullDay", label: "Día completo" },
];

export function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showEditArticle, setShowEditArticle] = useState(false);
  const [selectedJuego, setSelectedJuego] = useState<Juego | null>(null);

  const { juegos, loading, error, getJuegos } = useJuego();
  const { reservations: misReservas, loading: reservasLoading, error: reservasError, refetch: refetchReservas } = useMyReservations();



  const handleShowAddArticle = () => {
    setShowAddArticle(true);
  }

  const handleJuegoAdded = () => {
    setShowAddArticle(false);
    
    getJuegos();
  }

  const handleEditJuego = (juego: Juego) => {
    setSelectedJuego(juego);
    setShowEditArticle(true);
  }

  const handleJuegoEdited = () => {
    setShowEditArticle(false);
    setSelectedJuego(null);
    getJuegos();
  }

  // Función para obtener el icono según el tipo de juego
  const getJuegoIcon = (tipo: 'MESA' | 'ROL') => {
    return tipo === 'MESA' ? Dice6 : BookOpen;
  };

  const handleCancelarReserva = async (slug: string) => {
    try {
      await reservationService.cancel(slug);
      toast({ title: "Reserva cancelada", description: "La reserva se ha cancelado correctamente." });
      refetchReservas();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error
        ?? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "No se pudo cancelar la reserva.";
      toast({ title: "Error", description: String(msg), variant: "destructive" });
    }
  };

  if (!user) {
    return <div>No user found</div>;
  }

 
  if (user.tipo !== 'SOCIO') {
    return <div>Acceso restringido: Solo para usuarios SOCIO</div>;
  }


  const misJuegos = juegos.filter(juego => juego.socio === user.username);

  return (
    <div className="pt-20 px-6 pb-6 content-center justify-center flex-row gap-4 items-center" >
      <Card>
        <CardHeader>
          <CardTitle>User Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Bienvenido, {user.username}</p>
          <p>Tipo de usuario: {user.tipo}</p>
        </CardContent>
        <CardContent>
          <Button onClick={handleShowAddArticle}>Agregar Juego</Button>
        </CardContent>
        <CardContent>
          {loading && <p className="text-muted-foreground">Cargando juegos...</p>}
          {error && <p className="text-destructive">Error: {error}</p>}
          {!loading && !error && misJuegos.length === 0 && (
            <p className="text-muted-foreground">No tienes juegos agregados aún</p>
          )}
        </CardContent>

        {/* Mis reservas */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Mis reservas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reservasLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Cargando reservas...</span>
            </div>
          )}
          {reservasError && (
            <p className="text-destructive">{reservasError}</p>
          )}
          {!reservasLoading && !reservasError && misReservas.length === 0 && (
            <p className="text-muted-foreground mb-4">No tienes reservas. Haz una desde la tienda.</p>
          )}
          {!reservasLoading && misReservas.length > 0 && (
            <div className="space-y-3 mb-4">
              {misReservas.map((r) => {
                const franjaLabel = FRANJAS.find((f) => f.value === r.franja_id)?.label ?? r.franja_id;
                return (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(r.fecha + "T12:00:00"), "EEEE, d MMM yyyy", { locale: es })}
                      </p>
                      <p className="text-sm text-muted-foreground">{franjaLabel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.estado === "CANCELADA" ? "secondary" : "default"}>
                        {r.estado === "CANCELADA" ? "Cancelada" : "Confirmada"}
                      </Badge>
                      {r.estado !== "CANCELADA" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelarReserva(r.slug)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Button variant="outline" onClick={() => navigate("/shop/rooms")}>
            Nueva reserva
          </Button>
        </CardContent>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {misJuegos.map((juego) => {
              const Icon = getJuegoIcon(juego.genero as 'MESA' | 'ROL');
              return (
                <div
                  key={juego.id}
                  className="group p-6 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {juego.titulo}
                  </h3>
                  {juego.descripcion && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                      {juego.descripcion}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline">{juego.genero}</Badge>
                    <Badge className={juego.estado === 'ACTIVO' ? 'bg-emerald-600' : 'bg-slate-600'}>
                      {juego.estado}
                    </Badge>
                  </div>
                  {(juego.jugadoresMin || juego.jugadoresMax) && (
                    <p className="text-xs text-muted-foreground">
                      Jugadores: {juego.jugadoresMin || '?'} - {juego.jugadoresMax || '?'}
                    </p>
                  )}
                  {juego.edadRecomendada && (
                    <p className="text-xs text-muted-foreground">
                      Edad recomendada: {juego.edadRecomendada}
                    </p>
                  )}
                  {juego.duracionMinutos && (
                    <p className="text-xs text-muted-foreground">
                      Duracion: {juego.duracionMinutos} minutos
                    </p>
                  )}
                  {juego.categoria && (
                    <p className="text-xs text-muted-foreground">
                      Categoria: {juego.categoria}
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditJuego(juego)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <CardFooter>
            <Button onClick={() => navigate("/profile")}>Volver</Button>
        </CardFooter>
      </Card>

      {/* Dialog para Agregar Juego */}
      <Dialog open={showAddArticle} onOpenChange={setShowAddArticle}>
        <DialogContent 
          className="max-w-md p-0 bg-background/95 backdrop-blur-md border-border shadow-xl"
          showCloseButton={true}
        >
          <div className="p-0">
            <AddArticle onSuccess={handleJuegoAdded} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Juego */}
      <Dialog open={showEditArticle} onOpenChange={setShowEditArticle}>
        <DialogContent 
          className="max-w-md p-0 bg-background/95 backdrop-blur-md border-border shadow-xl"
          showCloseButton={true}
        >
          <div className="p-0">
            {selectedJuego && (
              <AddArticle
                mode="edit"
                initialJuego={selectedJuego}
                onSuccess={handleJuegoEdited}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
