import { useState, useEffect } from "react";
import { juegoService, type Juego, type CreateJuegoRequest } from "@/src/services/juego.service";
import { useAuth } from "@/src/context/auth-context";

export function useJuego() {
    const { user } = useAuth();
    const [juegos, setJuegos] = useState<Juego[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getJuegos = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await juegoService.getMyJuegos();
            setJuegos(response.data);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al obtener los juegos';
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

    // Cargar juegos al montar si hay usuario
    useEffect(() => {
        if (user) {
            getJuegos();
        }
    }, [user]);

    return {
        juegos,
        loading,
        error,
        getJuegos,
        createJuego,
    };
}
