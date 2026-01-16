from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class BookingCreateDto(BaseModel):
    """DTO para crear una reserva"""
    game_room_id: int
    titulo: str
    descripcion: Optional[str] = None
    fecha_inicio: datetime
    fecha_fin: datetime
    usuario: Optional[str] = None
    
    @field_validator('fecha_fin')
    @classmethod
    def validate_fecha_fin(cls, v, info):
        """Validar que fecha_fin sea posterior a fecha_inicio"""
        if hasattr(info, 'data') and 'fecha_inicio' in info.data:
            if v <= info.data['fecha_inicio']:
                raise ValueError('La fecha de fin debe ser posterior a la fecha de inicio')
        return v


class BookingUpdateDto(BaseModel):
    """DTO para actualizar una reserva"""
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    usuario: Optional[str] = None


class BookingResponseDto(BaseModel):
    """DTO para la respuesta de Booking"""
    id: int
    game_room_id: int
    titulo: str
    descripcion: Optional[str]
    fecha_inicio: datetime
    fecha_fin: datetime
    usuario: Optional[str]
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True
