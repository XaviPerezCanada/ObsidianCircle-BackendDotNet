using MiProyecto.Application.Common;
using MiProyecto.Application.Reservations.Interfaces;

namespace MiProyecto.Application.Reservations.Services.CancelReservation;

public sealed class CancelReservationHandler
{
    private readonly IReservationRepository _reservations;

    public CancelReservationHandler(IReservationRepository reservations)
        => _reservations = reservations;

    public async Task<Result<bool>> HandleAsync(Guid reservationId)
    {
        var reservation = await _reservations.GetByIdWithBlocksAsync(reservationId);

        if (reservation is null)
            return Result<bool>.Failure("Reserva no existe.");

        reservation.Cancelar();

        await _reservations.RemoveBlocksAsync(reservation.Blocks);
        await _reservations.UpdateAsync(reservation);

        return Result<bool>.Success(true);
    }
}
