from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from infrastructure.database.database import Base
from domain.entities.GameRoom import GameRoomStatus


class GameRoomModel(Base):
    """Modelo de base de datos para GameRoom"""
    __tablename__ = "game_rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String, nullable=False)
    status = Column(SQLEnum(GameRoomStatus), nullable=False, default=GameRoomStatus.INACTIVA)
    capacidad = Column(Integer, nullable=False)
    precio = Column(Float, nullable=True)  # None significa gratis
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
