import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { reservationService, type Reserva } from "@/src/services/reservation.service";

/**
 * Reservas de una sala para una fecha (para mostrar ocupación del día).
 * Solo hace fetch cuando hay fecha y gameRoomId.
 * refetch: actualiza la lista (útil tras un 409 para refrescar el estado).
 */
export function useReservationsForDay(
  date: Date | undefined,
  gameRoomId: string | undefined
) {
  const [reservations, setReservations] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    if (!date || !gameRoomId) {
      setReservations([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const data = await reservationService.getByDateAndRoom(dateStr, gameRoomId);
      setReservations(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Error al cargar las reservas del día.";
      setError(String(msg));
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [date?.getTime(), gameRoomId]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return { reservations, loading, error, refetch: fetchReservations };
}
