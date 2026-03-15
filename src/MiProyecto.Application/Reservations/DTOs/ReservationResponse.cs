using MiProyecto.Domain.Reservation;


namespace MiProyecto.Application.Reservations.Dtos;

public sealed class ReservationResponse
{
    public Guid Id { get; init; }
    public string Slug { get; init; } = default!;
    public Guid GameRoomId { get; init; }
    public Guid UserId { get; init; }
    public DateOnly Date { get; init; }
    public TimeSlot Slot { get; init; }
    public ReservationStatus Estado { get; init; }
    public int? BoardGameId { get; init; }
}
