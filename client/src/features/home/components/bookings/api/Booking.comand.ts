import { api } from '../../../../../api/axios';
import { 
  type createBookingServiceParams,
  type BookingResponseDto,
  type updateBookingServiceParams
} from '../bookingService.param'

/**
 * Crea una nueva reserva en el backend FastAPI
 * @param booking - Datos de la reserva a crear
 * @returns La reserva creada con todos sus datos incluyendo ID y fecha_creacion
 */
export const createBookingCommand = async (
  booking: createBookingServiceParams
): Promise<BookingResponseDto> => {
  const { data } = await api.post<BookingResponseDto>('/api/bookings/', booking);
  return data;
};

/**
 * Actualiza una reserva existente
 * NOTA: Esta funcionalidad aún no está implementada en el backend FastAPI
 * @param id - ID de la reserva a actualizar
 * @param booking - Datos actualizados de la reserva
 * @returns La reserva actualizada
 */
export const updateBookingCommand = async (
  id: number, 
  booking: updateBookingServiceParams
): Promise<BookingResponseDto> => {
  // TODO: Implementar cuando el backend tenga el endpoint PUT /api/bookings/{id}
  const { data } = await api.put<BookingResponseDto>(`/api/bookings/${id}`, booking);
  return data;
};

/**
 * Elimina una reserva
 * NOTA: Esta funcionalidad aún no está implementada en el backend FastAPI
 * @param id - ID de la reserva a eliminar
 * @returns Confirmación de eliminación
 */
export const deleteBookingCommand = async (id: number): Promise<void> => {
  // TODO: Implementar cuando el backend tenga el endpoint DELETE /api/bookings/{id}
  await api.delete(`/api/bookings/${id}`);
};
