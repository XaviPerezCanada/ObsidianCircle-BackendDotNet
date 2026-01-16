from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from domain.entities.GameRoom import GameRoomStatus


class GameRoomCreateDto(BaseModel):
    """DTO para crear una GameRoom"""
    slug: str
    nombre: str
    status: GameRoomStatus = GameRoomStatus.INACTIVA
    capacidad: int
    precio: Optional[float] = None  # None significa gratis


class GameRoomResponseDto(BaseModel):
    """DTO para la respuesta de GameRoom"""
    id: int
    slug: str
    nombre: str
    status: GameRoomStatus
    capacidad: int
    precio: Optional[float]
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True
