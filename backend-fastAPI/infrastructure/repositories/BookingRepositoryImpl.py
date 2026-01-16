from typing import List, Optional
from sqlalchemy import or_
from datetime import datetime
from sqlalchemy.orm import Session
from domain.entities.Booking import Booking
from domain.repositories.BookingRepository import BookingRepository
from infrastructure.database.models.BookingModel import BookingModel


class BookingRepositoryImpl(BookingRepository):
    """Implementación del repositorio de Booking usando SQLAlchemy"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create(self, booking: Booking) -> Booking:
        """Crea una nueva reserva"""
        db_booking = BookingModel(
            game_room_id=booking.game_room_id,
            titulo=booking.titulo,
            descripcion=booking.descripcion,
            fecha_inicio=booking.fecha_inicio,
            fecha_fin=booking.fecha_fin,
            usuario=booking.usuario
        )
        self.db.add(db_booking)
        self.db.commit()
        self.db.refresh(db_booking)
        
        return self._to_entity(db_booking)
    
    async def get_by_id(self, id: int) -> Optional[Booking]:
        """Obtiene una reserva por su ID"""
        db_booking = self.db.query(BookingModel).filter(BookingModel.id == id).first()
        return self._to_entity(db_booking) if db_booking else None
    
    async def get_by_game_room_id(self, game_room_id: int) -> List[Booking]:
        """Obtiene todas las reservas de una sala"""
        db_bookings = self.db.query(BookingModel).filter(
            BookingModel.game_room_id == game_room_id
        ).order_by(BookingModel.fecha_inicio).all()
        
        return [self._to_entity(booking) for booking in db_bookings]
    
    async def get_by_date_range(
        self, 
        game_room_id: int, 
        fecha_inicio: datetime, 
        fecha_fin: datetime
    ) -> List[Booking]:
        """Obtiene reservas de una sala en un rango de fechas"""
        db_bookings = self.db.query(BookingModel).filter(
            BookingModel.game_room_id == game_room_id,
            BookingModel.fecha_inicio >= fecha_inicio,
            BookingModel.fecha_fin <= fecha_fin
        ).order_by(BookingModel.fecha_inicio).all()
        
        return [self._to_entity(booking) for booking in db_bookings]
    
    async def check_overlapping(
        self,
        game_room_id: int,
        fecha_inicio: datetime,
        fecha_fin: datetime,
        exclude_id: Optional[int] = None
    ) -> bool:
        """
        Verifica si existe una reserva que se solapa con el rango de fechas dado.
        Dos reservas se solapan si:
        - La nueva reserva empieza durante una existente
        - La nueva reserva termina durante una existente  
        - La nueva reserva contiene completamente una existente
        - Una reserva existente contiene completamente la nueva
        """
        query = self.db.query(BookingModel).filter(
            BookingModel.game_room_id == game_room_id,
            # Condiciones de solapamiento usando or_ para OR lógico
            or_(
                # Caso 1: Nueva reserva empieza durante una existente
                ((BookingModel.fecha_inicio <= fecha_inicio) & (BookingModel.fecha_fin > fecha_inicio)),
                # Caso 2: Nueva reserva termina durante una existente
                ((BookingModel.fecha_inicio < fecha_fin) & (BookingModel.fecha_fin >= fecha_fin)),
                # Caso 3: Nueva reserva contiene completamente una existente
                ((BookingModel.fecha_inicio >= fecha_inicio) & (BookingModel.fecha_fin <= fecha_fin)),
                # Caso 4: Existente contiene completamente la nueva
                ((BookingModel.fecha_inicio <= fecha_inicio) & (BookingModel.fecha_fin >= fecha_fin))
            )
        )
        
        # Excluir una reserva específica (útil para actualizaciones)
        if exclude_id:
            query = query.filter(BookingModel.id != exclude_id)
        
        overlapping = query.first()
        return overlapping is not None
    
    async def get_all(self) -> List[Booking]:
        """Obtiene todas las reservas"""
        db_bookings = self.db.query(BookingModel).order_by(BookingModel.fecha_inicio).all()
        return [self._to_entity(booking) for booking in db_bookings]
    
    async def update(self, booking: Booking) -> Booking:
        """Actualiza una reserva existente"""
        db_booking = self.db.query(BookingModel).filter(BookingModel.id == booking.id).first()
        
        if not db_booking:
            raise ValueError(f"Booking con id {booking.id} no encontrada")
        
        db_booking.titulo = booking.titulo
        db_booking.descripcion = booking.descripcion
        db_booking.fecha_inicio = booking.fecha_inicio
        db_booking.fecha_fin = booking.fecha_fin
        db_booking.usuario = booking.usuario
        
        self.db.commit()
        self.db.refresh(db_booking)
        
        return self._to_entity(db_booking)
    
    async def delete(self, id: int) -> bool:
        """Elimina una reserva por su ID"""
        db_booking = self.db.query(BookingModel).filter(BookingModel.id == id).first()
        
        if not db_booking:
            return False
        
        self.db.delete(db_booking)
        self.db.commit()
        return True
    
    def _to_entity(self, db_booking: BookingModel) -> Booking:
        """Convierte un modelo de base de datos a una entidad de dominio"""
        return Booking(
            id=db_booking.id,
            game_room_id=db_booking.game_room_id,
            titulo=db_booking.titulo,
            descripcion=db_booking.descripcion,
            fecha_inicio=db_booking.fecha_inicio,
            fecha_fin=db_booking.fecha_fin,
            usuario=db_booking.usuario,
            fecha_creacion=db_booking.fecha_creacion
        )
