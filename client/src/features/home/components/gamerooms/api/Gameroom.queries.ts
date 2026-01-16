import { api } from "../../../../../api/axios";
import { type GameRoomResponseDto } from "../gameroomService.param";

/**
 * Obtiene todas las salas de juegos del backend FastAPI
 * @returns Lista de todas las salas de juegos
 */
export const getGameroomsQuery = async (): Promise<GameRoomResponseDto[]> => {
  const { data } = await api.get<GameRoomResponseDto[]>('/api/gamerooms/');
  return data;
};

/**
 * Obtiene una sala de juegos por su slug
 * @param slug - Slug único de la sala de juegos
 * @returns La sala de juegos encontrada o lanza error 404 si no existe
 */
export const getGameroomBySlugQuery = async (slug: string): Promise<GameRoomResponseDto> => {
  const { data } = await api.get<GameRoomResponseDto>(`/api/gamerooms/slug/${slug}`);
  return data;
};

/**
 * Obtiene una sala de juegos por su ID
 * @param id - ID numérico de la sala de juegos
 * @returns La sala de juegos encontrada o lanza error 404 si no existe
 */
export const getGameroomByIdQuery = async (id: number): Promise<GameRoomResponseDto> => {
  const { data } = await api.get<GameRoomResponseDto>(`/api/gamerooms/${id}`);
  return data;
};
