from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime
from domain.entities.Booking import Booking


class BookingRepository(ABC):
    """Interfaz del repositorio de Booking"""
    
    @abstractmethod
    async def create(self, booking: Booking) -> Booking:
        """Crea una nueva reserva"""
        pass
    
    @abstractmethod
    async def get_by_id(self, id: int) -> Optional[Booking]:
        """Obtiene una reserva por su ID"""
        pass
    
    @abstractmethod
    async def get_by_game_room_id(self, game_room_id: int) -> List[Booking]:
        """Obtiene todas las reservas de una sala"""
        pass
    
    @abstractmethod
    async def get_by_date_range(
        self, 
        game_room_id: int, 
        fecha_inicio: datetime, 
        fecha_fin: datetime
    ) -> List[Booking]:
        """Obtiene reservas de una sala en un rango de fechas"""
        pass
    
    @abstractmethod
    async def check_overlapping(
        self,
        game_room_id: int,
        fecha_inicio: datetime,
        fecha_fin: datetime,
        exclude_id: Optional[int] = None
    ) -> bool:
        """Verifica si existe una reserva que se solapa con el rango de fechas dado"""
        pass
    
    @abstractmethod
    async def get_all(self) -> List[Booking]:
        """Obtiene todas las reservas"""
        pass
    
    @abstractmethod
    async def update(self, booking: Booking) -> Booking:
        """Actualiza una reserva existente"""
        pass
    
    @abstractmethod
    async def delete(self, id: int) -> bool:
        """Elimina una reserva por su ID"""
        pass
