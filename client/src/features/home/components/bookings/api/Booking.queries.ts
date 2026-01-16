import { api } from "../../../../../api/axios";
import { type BookingResponseDto } from "../bookingService.param";

/**
 * Obtiene todas las reservas del backend FastAPI
 * @returns Lista de todas las reservas
 */
export const getBookingsQuery = async (): Promise<BookingResponseDto[]> => {
  const { data } = await api.get<BookingResponseDto[]>('/api/bookings/');
  return data;
};

/**
 * Obtiene todas las reservas de una sala específica
 * @param gameRoomId - ID de la sala de juegos
 * @returns Lista de reservas de la sala
 */
export const getBookingsByGameRoomQuery = async (
  gameRoomId: number
): Promise<BookingResponseDto[]> => {
  const { data } = await api.get<BookingResponseDto[]>(`/api/bookings/game-room/${gameRoomId}`);
  return data;
};

/**
 * Obtiene una reserva por su ID
 * @param id - ID numérico de la reserva
 * @returns La reserva encontrada o lanza error 404 si no existe
 */
export const getBookingByIdQuery = async (id: number): Promise<BookingResponseDto> => {
  const { data } = await api.get<BookingResponseDto>(`/api/bookings/${id}`);
  return data;
};
