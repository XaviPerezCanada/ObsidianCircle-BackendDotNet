// Tipo union para coincidir con el backend FastAPI (usando tipo union en lugar de enum por erasableSyntaxOnly)
export type GameRoomStatus = "activa" | "inactiva" | "llena" | "mantenimiento";

// Constantes para facilitar el uso
export const GameRoomStatusValues = {
    ACTIVA: "activa" as const,
    INACTIVA: "inactiva" as const,
    LLENA: "llena" as const,
    MANTENIMIENTO: "mantenimiento" as const,
} as const;

// Interface para la respuesta del backend FastAPI (GameRoomResponseDto)
export interface GameRoomResponseDto {
    id: number;
    slug: string;
    nombre: string;
    status: GameRoomStatus;
    capacidad: number;
    precio: number | null;
    fecha_creacion: string; // ISO datetime string
}

// Interface para crear una GameRoom (GameRoomCreateDto)
export interface createGameroomServiceParams {
    slug: string;
    nombre: string;
    status?: GameRoomStatus;
    capacidad: number;
    precio?: number | null;
}

// Alias para mantener compatibilidad con código existente
export interface getGameroomsServiceParams extends GameRoomResponseDto {}

export interface getGameroomBySlugServiceResponse extends GameRoomResponseDto {}

// Interface para actualizar (cuando se implemente en el backend)
export interface updateGameroomServiceParams {
    slug?: string;
    nombre?: string;
    status?: GameRoomStatus;
    capacidad?: number;
    precio?: number | null;
}

export interface deleteGameroomServiceParams {
    id?: number;
    slug?: string;
}