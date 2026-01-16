from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from infrastructure.database.database import get_db
from infrastructure.repositories.GameRoomRepositoryImpl import GameRoomRepositoryImpl
from application.use_cases.CreateGameRoomUseCase import CreateGameRoomUseCase
from application.use_cases.GetGameRoomUseCase import GetGameRoomUseCase
from application.dtos.GameRoomDto import GameRoomCreateDto, GameRoomResponseDto

router = APIRouter(prefix="/api/gamerooms", tags=["GameRooms"])


def get_game_room_repository(db: Session = Depends(get_db)) -> GameRoomRepositoryImpl:
    """Dependencia para obtener el repositorio de GameRoom"""
    return GameRoomRepositoryImpl(db)


@router.post("/", response_model=GameRoomResponseDto, status_code=status.HTTP_201_CREATED)
async def create_game_room(
    dto: GameRoomCreateDto,
    repository: GameRoomRepositoryImpl = Depends(get_game_room_repository)
):
    """Crea una nueva sala de juegos"""
    try:
        use_case = CreateGameRoomUseCase(repository)
        return await use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=List[GameRoomResponseDto])
async def get_all_game_rooms(
    repository: GameRoomRepositoryImpl = Depends(get_game_room_repository)
):
    """Obtiene todas las salas de juegos"""
    use_case = GetGameRoomUseCase(repository)
    return await use_case.get_all()


@router.get("/{id}", response_model=GameRoomResponseDto)
async def get_game_room_by_id(
    id: int,
    repository: GameRoomRepositoryImpl = Depends(get_game_room_repository)
):
    """Obtiene una sala de juegos por su ID"""
    use_case = GetGameRoomUseCase(repository)
    game_room = await use_case.get_by_id(id)
    
    if not game_room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"GameRoom con id {id} no encontrada"
        )
    
    return game_room


@router.get("/slug/{slug}", response_model=GameRoomResponseDto)
async def get_game_room_by_slug(
    slug: str,
    repository: GameRoomRepositoryImpl = Depends(get_game_room_repository)
):
    """Obtiene una sala de juegos por su slug"""
    use_case = GetGameRoomUseCase(repository)
    game_room = await use_case.get_by_slug(slug)
    
    if not game_room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"GameRoom con slug '{slug}' no encontrada"
        )
    
    return game_room
