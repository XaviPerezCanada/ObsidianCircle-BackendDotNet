using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Application.Common;
using MiProyecto.Application.Reservations.Dtos;
using MiProyecto.Application.Reservations.Interfaces;
using MiProyecto.Application.GameRooms.Interfaces;
using MiProyecto.Domain.Reservation.Entities;

namespace MiProyecto.Application.Reservations.UseCases.CreateReservation;

public sealed class CreateReservationHandler
{
    private readonly IGameRoomRepository _rooms;
    private readonly IReservationRepository _reservations;
    private readonly IBoardGameRepository _boardGames;

    public CreateReservationHandler(
        IGameRoomRepository rooms,
        IReservationRepository reservations,
        IBoardGameRepository boardGames)
    {
        _rooms = rooms;
        _reservations = reservations;
        _boardGames = boardGames;
    }

    public async Task<Result<ReservationResponse>> HandleAsync(CreateReservationRequest req)
    {
        var room = await _rooms.GetByIdAsync(req.GameRoomId);
        if (room is null) return Result<ReservationResponse>.Failure("Sala no existe.");
        if (!room.IsAvailable) return Result<ReservationResponse>.Failure("Sala no disponible.");

        if (req.BoardGameId is not null)
        {
            var exists = await _boardGames.ExistsAsync(req.BoardGameId.Value);
            if (!exists) return Result<ReservationResponse>.Failure("Juego no existe.");
        }

        var reservation = new Reservation(req.GameRoomId, req.UserId, req.Date, req.Slot, req.BoardGameId);

        var (ok, conflict) = await _reservations.TryAddAsync(reservation);
        if (conflict) return Result<ReservationResponse>.Failure("La sala ya está reservada en ese horario.");
        if (!ok) return Result<ReservationResponse>.Failure("No se pudo crear la reserva.");

        return Result<ReservationResponse>.Success(new ReservationResponse
        {
            Id = reservation.Id,
            Slug = reservation.Slug,
            GameRoomId = reservation.GameRoomId,
            UserId = reservation.UserId,
            Date = reservation.Date,
            Slot = reservation.Franja,
            BoardGameId = reservation.BoardGameId,
            Estado = reservation.Estado
        });
    }
}
