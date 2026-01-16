from datetime import datetime
from typing import Optional
from enum import Enum


class GameRoomStatus(str, Enum):
    """Estados posibles de una sala de juegos"""
    ACTIVA = "activa"
    INACTIVA = "inactiva"
    LLENA = "llena"
    MANTENIMIENTO = "mantenimiento"


class GameRoom:
    """Entidad de dominio GameRoom"""
    
    def __init__(
        self,
        id: Optional[int] = None,
        slug: str = "",
        nombre: str = "",
        status: GameRoomStatus = GameRoomStatus.INACTIVA,
        capacidad: int = 0,
        precio: Optional[float] = None,
        fecha_creacion: Optional[datetime] = None
    ):
        self.id = id
        self.slug = slug
        self.nombre = nombre
        self.status = status
        self.capacidad = capacidad
        self.precio = precio  # None significa gratis
        self.fecha_creacion = fecha_creacion or datetime.now()
    
    def is_gratis(self) -> bool:
        """Verifica si la sala es gratuita"""
        return self.precio is None or self.precio == 0.0
    
    def __repr__(self) -> str:
        return f"GameRoom(id={self.id}, slug={self.slug}, nombre={self.nombre}, status={self.status})"
