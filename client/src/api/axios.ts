import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

// URL del backend FastAPI (por defecto http://localhost:8000 si no está configurado)
// Asegurarse de usar HTTP, no HTTPS
let baseURL: string = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_PY || 'http://localhost:8000';

// Forzar HTTP si viene como HTTPS (el backend FastAPI no tiene SSL)
if (baseURL.startsWith('https://')) {
    baseURL = baseURL.replace('https://', 'http://');
    console.warn('⚠️  HTTPS detectado pero el backend usa HTTP. Cambiando a HTTP:', baseURL);
}

// Validar que la URL comience con http://
if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
    baseURL = `http://${baseURL}`;
}

// Log para depuración
console.log('🔗 Configuración Axios:', {
    baseURL,
    envVars: {
        VITE_API_URL: import.meta.env.VITE_API_URL,
        VITE_API_URL_PY: import.meta.env.VITE_API_URL_PY
    },
    protocol: baseURL.startsWith('http://') ? 'HTTP ✅' : baseURL.startsWith('https://') ? 'HTTPS ⚠️' : 'Desconocido ❌'
});

export const api: AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// --- Interceptores Tipados ---

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Log para depuración
        console.log('📤 Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`
        });
        
        // Aquí añadiremos el token más adelante
        // const token = localStorage.getItem('token');
        // if (token && config.headers) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log('📥 Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    (error) => {
        // Manejo de errores mejorado con logging
        if (error.response) {
            // El servidor respondió con un código de error
            console.error('❌ Response Error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                url: error.config?.url,
                data: error.response.data,
                message: error.message
            });
        } else if (error.request) {
            // La petición se hizo pero no hubo respuesta
            console.error('❌ Network Error:', {
                message: error.message,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown'
            });
        } else {
            // Algo pasó al configurar la petición
            console.error('❌ Request Setup Error:', error.message);
        }
        
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized");
        }
        
        return Promise.reject(error);
    }
);

