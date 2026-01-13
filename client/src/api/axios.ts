import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';


const baseURL: string = import.meta.env.VITE_API_URL as string;

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
        // Aquí añadiremos el token más adelante
        // const token = localStorage.getItem('token');
        // if (token && config.headers) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        // Manejo de errores igual que antes
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized");
        }
        return Promise.reject(error);
    }
);

