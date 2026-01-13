import {api} from '../api/axios';

// 1. Definimos el "Contrato" (Interface)
// Esto debe coincidir con tu clase de C# WeatherForecast
export interface WeatherForecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

// 2. Tipamos la respuesta de la función
export const getWeather = async (): Promise<WeatherForecast[]> => {
   
    const response = await api.get<WeatherForecast[]>('/weatherforecast');
    return response.data;
};