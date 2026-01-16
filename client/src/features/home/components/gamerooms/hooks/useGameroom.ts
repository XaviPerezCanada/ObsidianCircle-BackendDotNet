import { useState, useEffect, useCallback } from 'react';
import {
  getGameroomsQuery,
  getGameroomBySlugQuery,
  getGameroomByIdQuery,
} from '../api/Gameroom.queries';
import {
  createGameroomCommand,
  updateGameroomCommand,
  deleteGameroomCommand,
} from '../api/Gameroom.comand';
import type {
  GameRoomResponseDto,
  createGameroomServiceParams,
  updateGameroomServiceParams,
} from '../gameroomService.param';

/**
 * Hook para obtener todas las salas de juegos
 */
export const useGamerooms = () => {
  const [gamerooms, setGamerooms] = useState<GameRoomResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGamerooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching gamerooms...');
      const data = await getGameroomsQuery();
      console.log('✅ Gamerooms fetched:', data);
      setGamerooms(data);
      return data;
    } catch (err: unknown) {
      console.error('❌ Error fetching gamerooms:', err);
      
      // Mejorar el manejo de errores para errores de Axios
      let errorMessage = 'Error al cargar las salas de juegos';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: unknown; statusText?: string } };
        if (axiosError.response) {
          errorMessage = `Error ${axiosError.response.status}: ${axiosError.response.statusText || 'Error desconocido'}`;
          if (axiosError.response.data && typeof axiosError.response.data === 'object' && 'detail' in axiosError.response.data) {
            errorMessage = String(axiosError.response.data.detail);
          }
        } else if ('request' in err) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend FastAPI esté ejecutándose.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      // No lanzamos el error para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGamerooms();
  }, [fetchGamerooms]);

  return {
    gamerooms,
    loading,
    error,
    refetch: fetchGamerooms,
  };
};

/**
 * Hook para obtener una sala de juegos por su slug
 */
export const useGameroomBySlug = (slug: string | null) => {
  const [gameroom, setGameroom] = useState<GameRoomResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGameroom = useCallback(async () => {
    if (!slug) {
      setGameroom(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getGameroomBySlugQuery(slug);
      setGameroom(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar la sala de juegos';
      setError(errorMessage);
      setGameroom(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchGameroom();
  }, [fetchGameroom]);

  return {
    gameroom,
    loading,
    error,
    refetch: fetchGameroom,
  };
};

/**
 * Hook para obtener una sala de juegos por su ID
 */
export const useGameroomById = (id: number | null) => {
  const [gameroom, setGameroom] = useState<GameRoomResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGameroom = useCallback(async () => {
    if (!id) {
      setGameroom(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getGameroomByIdQuery(id);
      setGameroom(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar la sala de juegos';
      setError(errorMessage);
      setGameroom(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGameroom();
  }, [fetchGameroom]);

  return {
    gameroom,
    loading,
    error,
    refetch: fetchGameroom,
  };
};

/**
 * Hook para crear una nueva sala de juegos
 */
export const useCreateGameroom = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createGameroom = useCallback(
    async (gameroomData: createGameroomServiceParams) => {
      try {
        setLoading(true);
        setError(null);
        const data = await createGameroomCommand(gameroomData);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al crear la sala de juegos';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createGameroom,
    loading,
    error,
  };
};

/**
 * Hook para actualizar una sala de juegos
 * NOTA: Requiere que el endpoint PUT esté implementado en el backend FastAPI
 */
export const useUpdateGameroom = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateGameroom = useCallback(
    async (id: number, gameroomData: updateGameroomServiceParams) => {
      try {
        setLoading(true);
        setError(null);
        const data = await updateGameroomCommand(id, gameroomData);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al actualizar la sala de juegos';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updateGameroom,
    loading,
    error,
  };
};

/**
 * Hook para eliminar una sala de juegos
 * NOTA: Requiere que el endpoint DELETE esté implementado en el backend FastAPI
 */
export const useDeleteGameroom = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteGameroom = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await deleteGameroomCommand(id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al eliminar la sala de juegos';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteGameroom,
    loading,
    error,
  };
};
