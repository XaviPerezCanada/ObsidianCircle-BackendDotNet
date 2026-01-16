from abc import ABC, abstractmethod
from typing import List, Optional
from domain.entities.GameRoom import GameRoom


class GameRoomRepository(ABC):
    """Interfaz del repositorio de GameRoom"""
    
    @abstractmethod
    async def create(self, game_room: GameRoom) -> GameRoom:
        """Crea una nueva sala de juegos"""
        pass
    
    @abstractmethod
    async def get_by_id(self, id: int) -> Optional[GameRoom]:
        """Obtiene una sala de juegos por su ID"""
        pass
    
    @abstractmethod
    async def get_by_slug(self, slug: str) -> Optional[GameRoom]:
        """Obtiene una sala de juegos por su slug"""
        pass
    
    @abstractmethod
    async def get_all(self) -> List[GameRoom]:
        """Obtiene todas las salas de juegos"""
        pass
    
    @abstractmethod
    async def update(self, game_room: GameRoom) -> GameRoom:
        """Actualiza una sala de juegos existente"""
        pass
    
    @abstractmethod
    async def delete(self, id: int) -> bool:
        """Elimina una sala de juegos por su ID"""
        pass
