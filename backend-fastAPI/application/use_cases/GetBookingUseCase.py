from typing import List, Optional
from datetime import datetime
from domain.repositories.BookingRepository import BookingRepository
from application.dtos.BookingDto import BookingResponseDto


class GetBookingUseCase:
    """Caso de uso para obtener reservas"""
    
    def __init__(self, booking_repository: BookingRepository):
        self.booking_repository = booking_repository
    
    async def get_by_id(self, id: int) -> Optional[BookingResponseDto]:
        """Obtiene una reserva por su ID"""
        booking = await self.booking_repository.get_by_id(id)
        
        if not booking:
            return None
        
        return BookingResponseDto(
            id=booking.id,
            game_room_id=booking.game_room_id,
            titulo=booking.titulo,
            descripcion=booking.descripcion,
            fecha_inicio=booking.fecha_inicio,
            fecha_fin=booking.fecha_fin,
            usuario=booking.usuario,
            fecha_creacion=booking.fecha_creacion
        )
    
    async def get_by_game_room_id(self, game_room_id: int) -> List[BookingResponseDto]:
        """Obtiene todas las reservas de una sala"""
        bookings = await self.booking_repository.get_by_game_room_id(game_room_id)
        
        return [
            BookingResponseDto(
                id=booking.id,
                game_room_id=booking.game_room_id,
                titulo=booking.titulo,
                descripcion=booking.descripcion,
                fecha_inicio=booking.fecha_inicio,
                fecha_fin=booking.fecha_fin,
                usuario=booking.usuario,
                fecha_creacion=booking.fecha_creacion
            )
            for booking in bookings
        ]
    
    async def get_by_date_range(
        self, 
        game_room_id: int, 
        fecha_inicio: datetime, 
        fecha_fin: datetime
    ) -> List[BookingResponseDto]:
        """Obtiene reservas de una sala en un rango de fechas"""
        bookings = await self.booking_repository.get_by_date_range(
            game_room_id, fecha_inicio, fecha_fin
        )
        
        return [
            BookingResponseDto(
                id=booking.id,
                game_room_id=booking.game_room_id,
                titulo=booking.titulo,
                descripcion=booking.descripcion,
                fecha_inicio=booking.fecha_inicio,
                fecha_fin=booking.fecha_fin,
                usuario=booking.usuario,
                fecha_creacion=booking.fecha_creacion
            )
            for booking in bookings
        ]
    
    async def get_all(self) -> List[BookingResponseDto]:
        """Obtiene todas las reservas"""
        bookings = await self.booking_repository.get_all()
        
        return [
            BookingResponseDto(
                id=booking.id,
                game_room_id=booking.game_room_id,
                titulo=booking.titulo,
                descripcion=booking.descripcion,
                fecha_inicio=booking.fecha_inicio,
                fecha_fin=booking.fecha_fin,
                usuario=booking.usuario,
                fecha_creacion=booking.fecha_creacion
            )
            for booking in bookings
        ]
