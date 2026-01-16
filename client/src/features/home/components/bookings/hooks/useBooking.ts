import { useState, useEffect, useCallback } from 'react';
import {
  getBookingsQuery,
  getBookingsByGameRoomQuery,
  getBookingByIdQuery,
} from '../api/Booking.queries';
import {
  createBookingCommand,
  updateBookingCommand,
  deleteBookingCommand,
} from '../api/Booking.comand';
import type {
  BookingResponseDto,
  createBookingServiceParams,
  updateBookingServiceParams,
} from '../bookingService.param';

/**
 * Hook para obtener todas las reservas
 */
export const useBookings = () => {
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBookingsQuery();
      setBookings(data);
      return data;
    } catch (err: unknown) {
      console.error('❌ Error fetching bookings:', err);
      
      let errorMessage = 'Error al cargar las reservas';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: unknown; statusText?: string } };
        if (axiosError.response) {
          errorMessage = `Error ${axiosError.response.status}: ${axiosError.response.statusText || 'Error desconocido'}`;
        } else if ('request' in err) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend FastAPI esté ejecutándose.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
  };
};

/**
 * Hook para obtener reservas de una sala específica
 */
export const useBookingsByGameRoom = (gameRoomId: number | null) => {
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!gameRoomId) {
      setBookings([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getBookingsByGameRoomQuery(gameRoomId);
      setBookings(data);
      return data;
    } catch (err: unknown) {
      console.error('❌ Error fetching bookings by game room:', err);
      
      let errorMessage = 'Error al cargar las reservas de la sala';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: unknown; statusText?: string } };
        if (axiosError.response) {
          errorMessage = `Error ${axiosError.response.status}: ${axiosError.response.statusText || 'Error desconocido'}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [gameRoomId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
  };
};

/**
 * Hook para crear una nueva reserva
 */
export const useCreateBooking = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(
    async (bookingData: createBookingServiceParams) => {
      try {
        setLoading(true);
        setError(null);
        const data = await createBookingCommand(bookingData);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al crear la reserva';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createBooking,
    loading,
    error,
  };
};
