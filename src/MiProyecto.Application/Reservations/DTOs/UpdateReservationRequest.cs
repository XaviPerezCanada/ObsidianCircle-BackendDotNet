using MiProyecto.Domain.Reservation;

namespace MiProyecto.Application.Reservations.Dtos;

public sealed class UpdateReservationRequest
{
    public DateOnly Date { get; init; }
    public TimeSlot Slot { get; init; }
    public int? BoardGameId { get; init; }
}
