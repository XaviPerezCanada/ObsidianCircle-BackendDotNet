import { useState, useEffect } from "react";
import { format } from "date-fns";
import { reservationService, type Reserva } from "@/src/services/reservation.service";

/**
 * Reservas de una sala para una fecha (para mostrar ocupación del día).
 * Solo hace fetch cuando hay fecha y gameRoomId.
 */
export function useReservationsForDay(
  date: Date | undefined,
  gameRoomId: string | undefined
) {
  const [reservations, setReservations] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !gameRoomId) {
      setReservations([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const dateStr = format(date, "yyyy-MM-dd");
    reservationService
      .getByDateAndRoom(dateStr, gameRoomId)
      .then((data) => {
        if (!cancelled) setReservations(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Error al cargar las reservas del día.";
          setError(String(msg));
          setReservations([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date?.getTime(), gameRoomId]);

  return { reservations, loading, error };
}
