from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from infrastructure.database.database import Base


class BookingModel(Base):
    """Modelo de base de datos para Booking"""
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    game_room_id = Column(Integer, ForeignKey("game_rooms.id"), nullable=False, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    fecha_inicio = Column(DateTime(timezone=True), nullable=False, index=True)
    fecha_fin = Column(DateTime(timezone=True), nullable=False)
    usuario = Column(String, nullable=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relación con GameRoom
    game_room = relationship("GameRoomModel", backref="bookings")
