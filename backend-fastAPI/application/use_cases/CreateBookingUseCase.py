from datetime import datetime
from domain.entities.Booking import Booking
from domain.repositories.BookingRepository import BookingRepository
from application.dtos.BookingDto import BookingCreateDto, BookingResponseDto


class CreateBookingUseCase:
    """Caso de uso para crear una reserva"""
    
    def __init__(self, booking_repository: BookingRepository):
        self.booking_repository = booking_repository
    
    async def execute(self, dto: BookingCreateDto) -> BookingResponseDto:
        """Ejecuta el caso de uso para crear una reserva"""
        
        # Validar que no haya solapamiento con otras reservas
        has_overlap = await self.booking_repository.check_overlapping(
            game_room_id=dto.game_room_id,
            fecha_inicio=dto.fecha_inicio,
            fecha_fin=dto.fecha_fin
        )
        
        if has_overlap:
            raise ValueError(
                f"Ya existe una reserva para esta sala en el horario seleccionado "
                f"({dto.fecha_inicio} - {dto.fecha_fin}). Por favor, elige otro horario."
            )
        
        # Crear la entidad de dominio
        booking = Booking(
            game_room_id=dto.game_room_id,
            titulo=dto.titulo,
            descripcion=dto.descripcion,
            fecha_inicio=dto.fecha_inicio,
            fecha_fin=dto.fecha_fin,
            usuario=dto.usuario
        )
        
        # Guardar en el repositorio
        created_booking = await self.booking_repository.create(booking)
        
        # Convertir a DTO de respuesta
        return BookingResponseDto(
            id=created_booking.id,
            game_room_id=created_booking.game_room_id,
            titulo=created_booking.titulo,
            descripcion=created_booking.descripcion,
            fecha_inicio=created_booking.fecha_inicio,
            fecha_fin=created_booking.fecha_fin,
            usuario=created_booking.usuario,
            fecha_creacion=created_booking.fecha_creacion
        )
