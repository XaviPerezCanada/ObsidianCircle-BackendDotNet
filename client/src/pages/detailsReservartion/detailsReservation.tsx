import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar } from "@/src/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Clock, Users, Calendar as CalendarIcon, Check, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useJuego } from "@/src/hooks/useJuego";
import { useReservationsForDay } from "@/src/hooks/useReservationsForDay";
import { gameRoomService, type GameRoom } from "@/src/services/sala.service";
import { reservationService, type TimeSlot } from "@/src/services/reservation.service";
import { toast } from "@/src/hooks/use-toast";

// Franjas horarias del backend (TimeSlot)
const FRANJAS: { value: TimeSlot; label: string }[] = [
  { value: "Morning", label: "Mañana" },
  { value: "Afternoon", label: "Tarde" },
  { value: "Night", label: "Noche" },
  { value: "FullDay", label: "Día completo" },
];

export default function DetailsReservation() {
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>("Morning");
  const [selectedJuegos, setSelectedJuegos] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { juegos, loading, error } = useJuego({ listAll: true });
  const {
    reservations: reservasDelDia,
    loading: reservasLoading,
    error: reservasError,
  } = useReservationsForDay(selectedDate, room?.id);

  // Cargar sala por slug (param o por defecto)
  useEffect(() => {
    const slug = roomSlug ?? "sala-principal";
    let cancelled = false;
    setRoomLoading(true);
    setRoomError(null);
    gameRoomService
      .getBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setRoom(data);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          const msg =
            err.response?.data?.message ??
            err.response?.data?.detail ??
            "No se pudo cargar la sala.";
          setRoomError(String(msg));
          setRoom(null);
        }
      })
      .finally(() => {
        if (!cancelled) setRoomLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roomSlug]);

  const toggleJuego = (juegoId: number) => {
    setSelectedJuegos((prev) =>
      prev.includes(juegoId)
        ? prev.filter((id) => id !== juegoId)
        : [...prev, juegoId]
    );
  };

  const handleReservar = async () => {
    if (!room) {
      toast({
        title: "Error",
        description: "No hay sala seleccionada.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedDate) {
      toast({
        title: "Falta la fecha",
        description: "Selecciona una fecha para la reserva.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await reservationService.create({
        sala_id: room.id,
        fecha: format(selectedDate, "yyyy-MM-dd"),
        franja_id: selectedSlot,
        juego_id: selectedJuegos.length > 0 ? selectedJuegos[0] : null,
      });
      toast({
        title: "Reserva creada",
        description: `Reserva para el ${format(selectedDate, "d/M/yyyy")} (${FRANJAS.find((f) => f.value === selectedSlot)?.label ?? selectedSlot}) registrada correctamente.`,
      });
      navigate("/user-dashboard");
    } catch (err: any) {
      const msg =
        err.response?.data?.error ??
        err.response?.data?.message ??
        err.message ??
        "No se pudo crear la reserva.";
      toast({
        title: "Error al reservar",
        description: String(msg),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Información de la sala seleccionada */}
      <Card>
        <CardHeader>
          {roomLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Cargando sala...</span>
            </div>
          )}
          {roomError && (
            <p className="text-destructive">{roomError}</p>
          )}
          {room && !roomLoading && (
            <>
              <CardTitle className="text-2xl">{room.name}</CardTitle>
              <CardDescription>{room.description}</CardDescription>
            </>
          )}
        </CardHeader>
        {room && (
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Capacidad: {room.capacity} personas</span>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Selecciona una fecha
            </CardTitle>
            <CardDescription>
              Elige el día para tu reserva. Las reservas del día se muestran al lado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              modifiers={{}}
              modifiersClassNames={{}}
              locale={es}
            />
          </CardContent>
          {selectedDate && (
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Fecha seleccionada:{" "}
                <span className="font-semibold text-foreground">
                  {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </span>
              </p>
            </CardFooter>
          )}
        </Card>

        {/* Reservas existentes del día */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas existentes</CardTitle>
            <CardDescription>
              {selectedDate
                ? `Reservas para ${format(selectedDate, "d 'de' MMMM", { locale: es })}`
                : "Selecciona una fecha para ver las reservas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              reservasLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Cargando reservas del día...</span>
                </div>
              ) : reservasError ? (
                <p className="text-sm text-destructive text-center py-4">
                  {reservasError}
                </p>
              ) : reservasDelDia.length > 0 ? (
                <div className="space-y-3">
                  {reservasDelDia.map((reserva) => {
                    const franjaLabel =
                      FRANJAS.find((f) => f.value === reserva.franja_id)
                        ?.label ?? reserva.franja_id;
                    const juegoNombre =
                      reserva.juego_id != null
                        ? juegos.find((j) => j.id === reserva.juego_id)
                            ?.titulo
                        : null;
                    return (
                      <Card
                        key={reserva.id}
                        className="border-l-4 border-l-primary"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">
                                {franjaLabel}
                                {juegoNombre ? ` · ${juegoNombre}` : ""}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {reserva.fecha}
                                </span>
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                reserva.estado === "CONFIRMADA"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {reserva.estado === "CANCELADA" ? "Cancelada" : "Confirmada"}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay reservas para esta fecha. ¡Perfecto para reservar!
                </p>
              )
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Selecciona una fecha para ver las reservas existentes
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Franja horaria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Franja horaria
          </CardTitle>
          <CardDescription>
            Elige mañana, tarde, noche o día completo para tu reserva.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {FRANJAS.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                variant={selectedSlot === value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSlot(value)}
              >
                {selectedSlot === value && <Check className="w-4 h-4 mr-1" />}
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selección de juegos */}
      <Card>
        <CardHeader>
          <CardTitle>Selecciona los juegos</CardTitle>
          <CardDescription>
            Elige uno o más juegos para tu reserva. Puedes seleccionar varios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="text-sm text-muted-foreground mb-2">
              Cargando juegos disponibles...
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive mb-2">
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {juegos.map((juego) => {
              const isSelected = selectedJuegos.includes(juego.id);
              return (
                <Card
                  key={juego.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/40 bg-primary/5"
                      : ""
                  }`}
                  onClick={() => toggleJuego(juego.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{juego.titulo}</CardTitle>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <CardDescription>
                      <Badge variant="secondary" className="text-xs">
                          {juego.categoria}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                        {juego.jugadoresMin ?? "?"} - {juego.jugadoresMax ?? "?"} jugadores
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {selectedJuegos.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Juegos seleccionados:</p>
              <div className="flex flex-wrap gap-2">
                {selectedJuegos.map((juegoId) => {
                  const juego = juegos.find((j) => j.id === juegoId);
                  return juego ? (
                    <Badge key={juegoId} variant="default">
                      {juego.titulo}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setSelectedJuegos([])}>
            Limpiar selección
          </Button>
          <Button
            onClick={handleReservar}
            disabled={!room || roomLoading || !selectedDate || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Confirmando...
              </>
            ) : (
              "Confirmar reserva"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
