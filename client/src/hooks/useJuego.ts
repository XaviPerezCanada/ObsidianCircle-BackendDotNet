import { useState, useEffect } from "react";
import { juegoService, type Juego, type CreateJuegoRequest } from "@/src/services/juego.service";
import { useAuth } from "@/src/context/auth-context";

export type UseJuegoOptions = {
    /** Si es true, carga todos los juegos (para tienda/carrusel). Si es false, carga solo "mis juegos" (para perfil). */
    listAll?: boolean;
};

export function useJuego(options?: UseJuegoOptions) {
    const { listAll = false } = options ?? {};
    const { user } = useAuth();
    const [juegos, setJuegos] = useState<Juego[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getJuegos = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = listAll
                ? await juegoService.getAll()
                : await juegoService.getMyJuegos();
            setJuegos(Array.isArray(response.data) ? response.data : []);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.response?.data?.detail || 'Error al obtener los juegos';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createJuego = async (data: CreateJuegoRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await juegoService.create(data);
            setJuegos(prev => [...prev, response.data]);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al crear el juego';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Cargar juegos al montar: todos (tienda) o solo "mis juegos" si hay usuario (perfil)
    useEffect(() => {
        if (listAll) {
            getJuegos();
        } else if (user) {
            getJuegos();
        }
    }, [listAll, user]);

    return {
        juegos,
        loading,
        error,
        getJuegos,
        createJuego,
    };
}
