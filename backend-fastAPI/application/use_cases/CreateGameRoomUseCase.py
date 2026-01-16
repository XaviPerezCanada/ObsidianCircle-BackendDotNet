from domain.entities.GameRoom import GameRoom
from domain.repositories.GameRoomRepository import GameRoomRepository
from application.dtos.GameRoomDto import GameRoomCreateDto, GameRoomResponseDto


class CreateGameRoomUseCase:
    """Caso de uso para crear una GameRoom"""
    
    def __init__(self, repository: GameRoomRepository):
        self.repository = repository
    
    async def execute(self, dto: GameRoomCreateDto) -> GameRoomResponseDto:
        """Ejecuta la creación de una GameRoom"""
        # Verificar si ya existe una sala con el mismo slug
        existing = await self.repository.get_by_slug(dto.slug)
        if existing:
            raise ValueError(f"Ya existe una sala con el slug: {dto.slug}")
        
        # Crear la entidad
        game_room = GameRoom(
            slug=dto.slug,
            nombre=dto.nombre,
            status=dto.status,
            capacidad=dto.capacidad,
            precio=dto.precio
        )
        
        # Guardar en el repositorio
        created_game_room = await self.repository.create(game_room)
        
        # Convertir a DTO de respuesta
        return GameRoomResponseDto(
            id=created_game_room.id,
            slug=created_game_room.slug,
            nombre=created_game_room.nombre,
            status=created_game_room.status,
            capacidad=created_game_room.capacidad,
            precio=created_game_room.precio,
            fecha_creacion=created_game_room.fecha_creacion
        )
