import { api } from '../../../../../api/axios';

/**
 * Función para probar la conexión con el backend FastAPI
 * @returns true si la conexión es exitosa, false en caso contrario
 */
export const testBackendConnection = async (): Promise<{
  success: boolean;
  message: string;
  data?: unknown;
}> => {
  try {
    console.log('🧪 Probando conexión con el backend...');
    
    // Probar el endpoint raíz
    const rootResponse = await api.get('/');
    console.log('✅ Endpoint raíz OK:', rootResponse.data);
    
    // Probar el endpoint de gamerooms
    const gameroomsResponse = await api.get('/api/gamerooms');
    console.log('✅ Endpoint gamerooms OK:', gameroomsResponse.data);
    
    return {
      success: true,
      message: 'Conexión exitosa con el backend FastAPI',
      data: {
        root: rootResponse.data,
        gamerooms: gameroomsResponse.data,
      },
    };
  } catch (error) {
    console.error('❌ Error en la prueba de conexión:', error);
    
    let message = 'Error desconocido al conectar con el backend';
    
    if (error && typeof error === 'object' && 'request' in error) {
      message = 'No se pudo conectar con el servidor. Verifica que el backend FastAPI esté ejecutándose en http://localhost:8000';
    } else if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; statusText?: string } };
      message = `Error ${axiosError.response?.status}: ${axiosError.response?.statusText || 'Error del servidor'}`;
    } else if (error instanceof Error) {
      message = error.message;
    }
    
    return {
      success: false,
      message,
    };
  }
};
