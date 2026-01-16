from datetime import datetime
from typing import Optional


class Booking:
    """Entidad de dominio Booking (Reserva)"""
    
    def __init__(
        self,
        id: Optional[int] = None,
        game_room_id: int = 0,
        titulo: str = "",
        descripcion: Optional[str] = None,
        fecha_inicio: Optional[datetime] = None,
        fecha_fin: Optional[datetime] = None,
        usuario: Optional[str] = None,
        fecha_creacion: Optional[datetime] = None
    ):
        self.id = id
        self.game_room_id = game_room_id
        self.titulo = titulo
        self.descripcion = descripcion
        self.fecha_inicio = fecha_inicio
        self.fecha_fin = fecha_fin
        self.usuario = usuario
        self.fecha_creacion = fecha_creacion or datetime.now()
    
    def __repr__(self) -> str:
        return f"Booking(id={self.id}, game_room_id={self.game_room_id}, titulo={self.titulo})"
