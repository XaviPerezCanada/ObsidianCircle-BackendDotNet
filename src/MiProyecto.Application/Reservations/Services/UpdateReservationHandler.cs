using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Application.Common;
using MiProyecto.Application.Reservations.Dtos;
using MiProyecto.Application.Reservations.Interfaces;
using MiProyecto.Domain.Reservation;
using MiProyecto.Domain.Reservation.Entities;

namespace MiProyecto.Application.Reservations.Services.UpdateReservation;

public sealed class UpdateReservationHandler
{
    private readonly IReservationRepository _reservations;
    private readonly IBoardGameRepository _boardGames;

    public UpdateReservationHandler(
        IReservationRepository reservations,
        IBoardGameRepository boardGames)
    {
        _reservations = reservations;
        _boardGames = boardGames;
    }

    public async Task<Result<ReservationResponse>> HandleAsync(Guid reservationId, UpdateReservationRequest req)
    {
        var reservation = await _reservations.GetByIdWithBlocksAsync(reservationId);
        if (reservation is null)
            return Result<ReservationResponse>.Failure("Reserva no existe.");

        if (reservation.Estado != ReservationStatus.Active)
            return Result<ReservationResponse>.Failure("Solo se pueden editar reservas activas.");

        // Validate board game exists
        if (req.BoardGameId is not null)
        {
            var exists = await _boardGames.ExistsAsync(req.BoardGameId.Value);
            if (!exists)
                return Result<ReservationResponse>.Failure("Juego no existe.");
        }

        // Check board game conflict: is the same game already reserved by someone else at the new date/slot?
        if (req.BoardGameId is not null)
        {
            var blocks = ToBlocks(req.Slot).ToList();
            var gameConflict = await _reservations.HasBoardGameConflictAsync(
                reservation.Id, req.BoardGameId.Value, req.Date, blocks);
            if (gameConflict)
                return Result<ReservationResponse>.Failure("El juego ya está reservado en esa franja horaria.");
        }

        // Capture old blocks before editing
        var oldBlocks = reservation.Blocks.ToList();

        // Apply domain changes (rebuilds Blocks collection)
        reservation.Editar(req.Date, req.Slot, req.BoardGameId);

        // Persist with conflict detection (room + slot)
        var (ok, conflict) = await _reservations.TryUpdateAsync(reservation, oldBlocks);
        if (conflict)
            return Result<ReservationResponse>.Failure("La sala ya está reservada en ese horario.");
        if (!ok)
            return Result<ReservationResponse>.Failure("No se pudo actualizar la reserva.");

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

    private static IEnumerable<BlockSlot> ToBlocks(TimeSlot franja) => franja switch
    {
        TimeSlot.Morning => new[] { BlockSlot.Morning },
        TimeSlot.Afternoon => new[] { BlockSlot.Afternoon },
        TimeSlot.Night => new[] { BlockSlot.Night },
        TimeSlot.FullDay => new[] { BlockSlot.Morning, BlockSlot.Afternoon, BlockSlot.Night },
        _ => throw new ArgumentOutOfRangeException(nameof(franja))
    };
}
