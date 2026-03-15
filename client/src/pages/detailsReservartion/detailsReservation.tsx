import { useState } from "react";
import { Calendar } from "@/src/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Clock, Users, Calendar as CalendarIcon, Check, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useJuego } from "@/src/hooks/useJuego";

// Mockup de reservas existentes
interface MockReservation {
  id: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  juego: string;
  jugadores: number;
  estado: "activa" | "completada" | "cancelada";
}

// Mockup de datos
const mockReservas: MockReservation[] = [
  {
    id: "1",
    fecha: new Date(2026, 1, 7),
    horaInicio: "10:00",
    horaFin: "12:00",
    juego: "Catan",
    jugadores: 4,
    estado: "activa",
  },
  {
    id: "2",
    fecha: new Date(2026, 1, 7),
    horaInicio: "14:00",
    horaFin: "16:00",
    juego: "Ticket to Ride",
    jugadores: 3,
    estado: "activa",
  },
  {
    id: "3",
    fecha: new Date(2026, 1, 8),
    horaInicio: "18:00",
    horaFin: "20:00",
    juego: "Wingspan",
    jugadores: 2,
    estado: "activa",
  },
];

export default function DetailsReservation() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedJuegos, setSelectedJuegos] = useState<number[]>([]);
  const [selectedSala] = useState({
    name: "Sala Principal",
    description: "Sala espaciosa con capacidad para 8 personas",
    capacity: 8,
    slug: "sala-principal",
  });

  const { juegos, loading, error } = useJuego({ listAll: true });

  // Debug: verificar que el componente se renderiza
  console.log("DetailsReservation component rendered");

  // Filtrar reservas por fecha seleccionada
  const reservasDelDia = selectedDate
    ? mockReservas.filter(
        (reserva) =>
          format(reserva.fecha, "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd")
      )
    : [];

  // Obtener fechas ocupadas para el calendario
  const fechasOcupadas = mockReservas.map((reserva) => reserva.fecha);

  const toggleJuego = (juegoId: number) => {
    setSelectedJuegos((prev) =>
      prev.includes(juegoId)
        ? prev.filter((id) => id !== juegoId)
        : [...prev, juegoId]
    );
  };

  const handleReservar = () => {
    if (!selectedDate) {
      alert("Por favor, selecciona una fecha");
      return;
    }
    if (selectedJuegos.length === 0) {
      alert("Por favor, selecciona al menos un juego");
      return;
    }
    console.log("Reserva:", {
      sala: selectedSala,
      fecha: selectedDate,
      juegos: selectedJuegos,
    });
    alert("Reserva realizada (mockup)");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Información de la sala seleccionada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{selectedSala.name}</CardTitle>
          <CardDescription>{selectedSala.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Capacidad: {selectedSala.capacity} personas</span>
          </div>
        </CardContent>
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
              Elige el día para tu reserva. Las fechas con reservas existentes
              están marcadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              modifiers={{
                booked: fechasOcupadas,
              }}
              modifiersClassNames={{
                booked: "bg-muted text-muted-foreground",
              }}
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
              reservasDelDia.length > 0 ? (
                <div className="space-y-3">
                  {reservasDelDia.map((reserva) => (
                    <Card key={reserva.id} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {reserva.juego}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {reserva.horaInicio} - {reserva.horaFin}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {reserva.jugadores} jugadores
                              </span>
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              reserva.estado === "activa"
                                ? "default"
                                : reserva.estado === "completada"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {reserva.estado}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
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
          <Button onClick={handleReservar} disabled={!selectedDate || selectedJuegos.length === 0}>
            Confirmar reserva
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
