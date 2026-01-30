using MiProyecto.Domain.Reservation;


namespace MiProyecto.Application.Reservations.Dtos;

public sealed class CreateReservationRequest
{
    public Guid GameRoomId { get; init; }
    public Guid UserId { get; init; }
    public DateOnly Date { get; init; }
    public TimeSlot Slot { get; init; }
    public int? BoardGameId { get; init; } 
}
