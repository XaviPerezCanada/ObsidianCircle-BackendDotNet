import { api } from '../../../../../api/axios';
import { 
  type createGameroomServiceParams,
  type GameRoomResponseDto,
  type updateGameroomServiceParams
} from '../gameroomService.param'

/**
 * Crea una nueva sala de juegos en el backend FastAPI
 * @param gameroom - Datos de la sala de juegos a crear
 * @returns La sala de juegos creada con todos sus datos incluyendo ID y fecha_creacion
 */
export const createGameroomCommand = async (
  gameroom: createGameroomServiceParams
): Promise<GameRoomResponseDto> => {
  const { data } = await api.post<GameRoomResponseDto>('/api/gamerooms', gameroom);
  return data;
};

/**
 * Actualiza una sala de juegos existente
 * NOTA: Esta funcionalidad aún no está implementada en el backend FastAPI
 * @param id - ID de la sala de juegos a actualizar
 * @param gameroom - Datos actualizados de la sala de juegos
 * @returns La sala de juegos actualizada
 */
export const updateGameroomCommand = async (
  id: number, 
  gameroom: updateGameroomServiceParams
): Promise<GameRoomResponseDto> => {
  // TODO: Implementar cuando el backend tenga el endpoint PUT /api/gamerooms/{id}
  const { data } = await api.put<GameRoomResponseDto>(`/api/gamerooms/${id}`, gameroom);
  return data;
};

/**
 * Elimina una sala de juegos
 * NOTA: Esta funcionalidad aún no está implementada en el backend FastAPI
 * @param id - ID de la sala de juegos a eliminar
 * @returns Confirmación de eliminación
 */
export const deleteGameroomCommand = async (id: number): Promise<void> => {
  // TODO: Implementar cuando el backend tenga el endpoint DELETE /api/gamerooms/{id}
  await api.delete(`/api/gamerooms/${id}`);
};
