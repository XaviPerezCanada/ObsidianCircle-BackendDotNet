import { useState, useEffect, useCallback } from "react";
import { reservationService, type Reserva } from "@/src/services/reservation.service";

/**
 * Reservas del usuario autenticado (GET /reservations/mine).
 * Incluye refetch para actualizar tras crear/cancelar.
 */
export function useMyReservations(enabled = true) {
  const [reservations, setReservations] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await reservationService.getMine();
      setReservations(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Error al cargar tus reservas.";
      setError(String(msg));
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return { reservations, loading, error, refetch: fetchReservations };
}
