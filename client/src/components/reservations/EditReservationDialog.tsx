import { useState } from "react";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { Calendar } from "@/src/components/ui/calendar";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Check, Clock, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { reservationService, type TimeSlot, type Reserva } from "@/src/services/reservation.service";
import { useReservationsForDay } from "@/src/hooks/useReservationsForDay";
import { useJuego } from "@/src/hooks/useJuego";
import { toast } from "@/src/hooks/use-toast";

const FRANJAS: { value: TimeSlot; label: string }[] = [
  { value: "Morning", label: "Mañana" },
  { value: "Afternoon", label: "Tarde" },
  { value: "Night", label: "Noche" },
  { value: "FullDay", label: "Día completo" },
];

type EditReservationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  reserva: Reserva;
  onSuccess: () => void;
};

export function EditReservationDialog({
  isOpen,
  onClose,
  reserva,
  onSuccess,
}: EditReservationDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(reserva.fecha + "T12:00:00")
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>(reserva.franja_id);
  const [selectedJuegoId, setSelectedJuegoId] = useState<number | null>(
    reserva.juego_id ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { juegos } = useJuego({ listAll: true });
  const {
    reservations: reservasDelDia,
    loading: reservasLoading,
    refetch: refetchReservasDelDia,
  } = useReservationsForDay(selectedDate, reserva.sala_id);

  // Only show active reservations (excluding the current one being edited)
  const reservasActivasDelDia = reservasDelDia.filter(
    (r) => r.estado !== "CANCELADA" && r.id !== reserva.id
  );

  const handleSubmit = async () => {
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
      await reservationService.update(reserva.slug, {
        fecha: format(selectedDate, "yyyy-MM-dd"),
        franja_id: selectedSlot,
        juego_id: selectedJuegoId,
      });
      toast({
        title: "Reserva actualizada",
        description: `La reserva se ha cambiado al ${format(
          selectedDate,
          "d/M/yyyy"
        )} (${FRANJAS.find((f) => f.value === selectedSlot)?.label ?? selectedSlot}).`,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const isConflict = status === 409;
      const msg = isConflict
        ? "La sala o el juego ya están reservados en esa franja. Actualizando la lista…"
        : ((err as { response?: { data?: { error?: string; message?: string } } })
            ?.response?.data?.error ??
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ??
          "No se pudo actualizar la reserva.");
      toast({
        title: isConflict ? "Conflicto de reserva" : "Error al editar",
        description: String(msg),
        variant: "destructive",
      });
      if (isConflict && refetchReservasDelDia) refetchReservasDelDia();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md border-border shadow-xl">
        <div className="space-y-4 p-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Editar reserva
          </h2>
          <p className="text-sm text-muted-foreground">
            Cambia la fecha, franja horaria o juego de tu reserva.
          </p>

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              locale={es}
            />
          </div>

          {selectedDate && (
            <p className="text-sm text-muted-foreground text-center">
              Nueva fecha:{" "}
              <span className="font-semibold text-foreground">
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </span>
            </p>
          )}

          {/* Time slot selection */}
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Franja horaria
            </p>
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
          </div>

          {/* Existing reservations for the selected day */}
          {selectedDate && (
            <div>
              <p className="text-sm font-medium mb-2">
                Reservas del día (excluyendo la tuya)
              </p>
              {reservasLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cargando…</span>
                </div>
              ) : reservasActivasDelDia.length > 0 ? (
                <div className="space-y-2">
                  {reservasActivasDelDia.map((r) => {
                    const franjaLabel =
                      FRANJAS.find((f) => f.value === r.franja_id)?.label ??
                      r.franja_id;
                    const juegoAsignado = r.juego_id
                      ? juegos.find((j) => j.id === r.juego_id)
                      : null;
                    return (
                      <Card key={r.id} className="border-l-4 border-l-orange-400">
                        <CardHeader className="py-2 px-3">
                          <CardTitle className="text-sm">{franjaLabel}</CardTitle>
                          <CardDescription className="text-xs">
                            {juegoAsignado
                              ? `Juego: ${juegoAsignado.titulo}`
                              : "Sin juego asignado"}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No hay otras reservas activas para este día. ¡Perfecto!
                </p>
              )}
            </div>
          )}

          {/* Game selection (optional) */}
          <div>
            <p className="text-sm font-medium mb-2">Juego (opcional)</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={selectedJuegoId === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedJuegoId(null)}
              >
                {selectedJuegoId === null && <Check className="w-4 h-4 mr-1" />}
                Sin juego
              </Button>
              {juegos.map((juego) => (
                <Button
                  key={juego.id}
                  type="button"
                  variant={selectedJuegoId === juego.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedJuegoId(juego.id)}
                >
                  {selectedJuegoId === juego.id && (
                    <Check className="w-4 h-4 mr-1" />
                  )}
                  {juego.titulo}
                </Button>
              ))}
            </div>
            {selectedJuegoId && (
              <div className="mt-2">
                <Badge variant="default">
                  {juegos.find((j) => j.id === selectedJuegoId)?.titulo ??
                    `Juego #${selectedJuegoId}`}
                </Badge>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedDate || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Guardando…
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
