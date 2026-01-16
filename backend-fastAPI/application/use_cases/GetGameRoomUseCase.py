from typing import List, Optional
from domain.repositories.GameRoomRepository import GameRoomRepository
from application.dtos.GameRoomDto import GameRoomResponseDto


class GetGameRoomUseCase:
    """Caso de uso para obtener GameRooms"""
    
    def __init__(self, repository: GameRoomRepository):
        self.repository = repository
    
    async def get_by_id(self, id: int) -> Optional[GameRoomResponseDto]:
        """Obtiene una GameRoom por su ID"""
        game_room = await self.repository.get_by_id(id)
        
        if not game_room:
            return None
        
        return GameRoomResponseDto(
            id=game_room.id,
            slug=game_room.slug,
            nombre=game_room.nombre,
            status=game_room.status,
            capacidad=game_room.capacidad,
            precio=game_room.precio,
            fecha_creacion=game_room.fecha_creacion
        )
    
    async def get_by_slug(self, slug: str) -> Optional[GameRoomResponseDto]:
        """Obtiene una GameRoom por su slug"""
        game_room = await self.repository.get_by_slug(slug)
        
        if not game_room:
            return None
        
        return GameRoomResponseDto(
            id=game_room.id,
            slug=game_room.slug,
            nombre=game_room.nombre,
            status=game_room.status,
            capacidad=game_room.capacidad,
            precio=game_room.precio,
            fecha_creacion=game_room.fecha_creacion
        )
    
    async def get_all(self) -> List[GameRoomResponseDto]:
        """Obtiene todas las GameRooms"""
        game_rooms = await self.repository.get_all()
        
        return [
            GameRoomResponseDto(
                id=gr.id,
                slug=gr.slug,
                nombre=gr.nombre,
                status=gr.status,
                capacidad=gr.capacidad,
                precio=gr.precio,
                fecha_creacion=gr.fecha_creacion
            )
            for gr in game_rooms
        ]
