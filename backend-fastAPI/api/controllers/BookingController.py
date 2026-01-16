from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from infrastructure.database.database import get_db
from infrastructure.repositories.BookingRepositoryImpl import BookingRepositoryImpl
from application.use_cases.CreateBookingUseCase import CreateBookingUseCase
from application.use_cases.GetBookingUseCase import GetBookingUseCase
from application.dtos.BookingDto import BookingCreateDto, BookingResponseDto


router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


def get_booking_repository(db: Session = Depends(get_db)) -> BookingRepositoryImpl:
    """Dependencia para obtener el repositorio de Booking"""
    return BookingRepositoryImpl(db)


@router.post("/", response_model=BookingResponseDto, status_code=status.HTTP_201_CREATED)
async def create_booking(
    dto: BookingCreateDto,
    repository: BookingRepositoryImpl = Depends(get_booking_repository)
):
    """Crea una nueva reserva"""
    try:
        use_case = CreateBookingUseCase(repository)
        return await use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=List[BookingResponseDto])
async def get_all_bookings(
    repository: BookingRepositoryImpl = Depends(get_booking_repository)
):
    """Obtiene todas las reservas"""
    use_case = GetBookingUseCase(repository)
    return await use_case.get_all()


@router.get("/game-room/{game_room_id}", response_model=List[BookingResponseDto])
async def get_bookings_by_game_room(
    game_room_id: int,
    repository: BookingRepositoryImpl = Depends(get_booking_repository)
):
    """Obtiene todas las reservas de una sala específica"""
    use_case = GetBookingUseCase(repository)
    return await use_case.get_by_game_room_id(game_room_id)


@router.get("/{id}", response_model=BookingResponseDto)
async def get_booking_by_id(
    id: int,
    repository: BookingRepositoryImpl = Depends(get_booking_repository)
):
    """Obtiene una reserva por su ID"""
    use_case = GetBookingUseCase(repository)
    booking = await use_case.get_by_id(id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking con id {id} no encontrada"
        )
    
    return booking
