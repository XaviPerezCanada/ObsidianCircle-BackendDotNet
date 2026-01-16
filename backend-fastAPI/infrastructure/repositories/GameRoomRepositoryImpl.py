from typing import List, Optional
from sqlalchemy.orm import Session
from domain.entities.GameRoom import GameRoom, GameRoomStatus
from domain.repositories.GameRoomRepository import GameRoomRepository
from infrastructure.database.models.GameRoomModel import GameRoomModel


class GameRoomRepositoryImpl(GameRoomRepository):
    """Implementación del repositorio de GameRoom usando SQLAlchemy"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create(self, game_room: GameRoom) -> GameRoom:
        """Crea una nueva sala de juegos"""
        db_game_room = GameRoomModel(
            slug=game_room.slug,
            nombre=game_room.nombre,
            status=game_room.status,
            capacidad=game_room.capacidad,
            precio=game_room.precio
        )
        self.db.add(db_game_room)
        self.db.commit()
        self.db.refresh(db_game_room)
        
        return self._to_entity(db_game_room)
    
    async def get_by_id(self, id: int) -> Optional[GameRoom]:
        """Obtiene una sala de juegos por su ID"""
        db_game_room = self.db.query(GameRoomModel).filter(GameRoomModel.id == id).first()
        return self._to_entity(db_game_room) if db_game_room else None
    
    async def get_by_slug(self, slug: str) -> Optional[GameRoom]:
        """Obtiene una sala de juegos por su slug"""
        db_game_room = self.db.query(GameRoomModel).filter(GameRoomModel.slug == slug).first()
        return self._to_entity(db_game_room) if db_game_room else None
    
    async def get_all(self) -> List[GameRoom]:
        """Obtiene todas las salas de juegos"""
        db_game_rooms = self.db.query(GameRoomModel).all()
        return [self._to_entity(gr) for gr in db_game_rooms]
    
    async def update(self, game_room: GameRoom) -> GameRoom:
        """Actualiza una sala de juegos existente"""
        db_game_room = self.db.query(GameRoomModel).filter(GameRoomModel.id == game_room.id).first()
        if not db_game_room:
            raise ValueError(f"GameRoom con id {game_room.id} no encontrada")
        
        db_game_room.slug = game_room.slug
        db_game_room.nombre = game_room.nombre
        db_game_room.status = game_room.status
        db_game_room.capacidad = game_room.capacidad
        db_game_room.precio = game_room.precio
        
        self.db.commit()
        self.db.refresh(db_game_room)
        
        return self._to_entity(db_game_room)
    
    async def delete(self, id: int) -> bool:
        """Elimina una sala de juegos por su ID"""
        db_game_room = self.db.query(GameRoomModel).filter(GameRoomModel.id == id).first()
        if not db_game_room:
            return False
        
        self.db.delete(db_game_room)
        self.db.commit()
        return True
    
    def _to_entity(self, db_model: GameRoomModel) -> Optional[GameRoom]:
        """Convierte un modelo de base de datos a una entidad de dominio"""
        if not db_model:
            return None
        
        return GameRoom(
            id=db_model.id,
            slug=db_model.slug,
            nombre=db_model.nombre,
            status=db_model.status,
            capacidad=db_model.capacidad,
            precio=db_model.precio,
            fecha_creacion=db_model.fecha_creacion
        )
