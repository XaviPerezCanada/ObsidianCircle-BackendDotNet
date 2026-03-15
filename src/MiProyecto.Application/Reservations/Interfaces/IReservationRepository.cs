using MiProyecto.Domain.Reservation.Entities;

namespace MiProyecto.Application.Reservations.Interfaces;

public interface IReservationRepository
{
    Task<(bool Ok, bool Conflict)> TryAddAsync(Reservation reservation);

    Task AddAsync(Reservation reservation);

    Task<Reservation?> GetByIdAsync(Guid id);

    Task<Reservation?> GetBySlugAsync(string slug, CancellationToken ct = default);

    Task<Reservation?> GetByIdWithBlocksAsync(Guid id);

    Task<Reservation?> GetBySlugWithBlocksAsync(string slug, CancellationToken ct = default);

    Task UpdateAsync(Reservation reservation);

    Task RemoveBlocksAsync(IEnumerable<ReservationBlock> blocks);

    Task<IReadOnlyList<Reservation>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);

    Task<IReadOnlyList<Reservation>> GetAllAsync(CancellationToken ct = default);

    Task<IReadOnlyList<Reservation>> GetByDateAndRoomAsync(DateOnly date, Guid gameRoomId, CancellationToken ct = default);
}
