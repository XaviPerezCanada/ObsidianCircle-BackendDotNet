// Interfaces para las reservas (Bookings)

export interface BookingResponseDto {
    id: number;
    game_room_id: number;
    titulo: string;
    descripcion: string | null;
    fecha_inicio: string; // ISO datetime string
    fecha_fin: string; // ISO datetime string
    usuario: string | null;
    fecha_creacion: string; // ISO datetime string
}

// Interface para crear una reserva
export interface createBookingServiceParams {
    game_room_id: number;
    titulo: string;
    descripcion?: string | null;
    fecha_inicio: string; // ISO datetime string
    fecha_fin: string; // ISO datetime string
    usuario?: string | null;
}

// Interface para actualizar una reserva
export interface updateBookingServiceParams {
    titulo?: string;
    descripcion?: string | null;
    fecha_inicio?: string;
    fecha_fin?: string;
    usuario?: string | null;
}
