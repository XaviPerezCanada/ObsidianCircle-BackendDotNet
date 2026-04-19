using MiProyecto.Domain.Reservation;
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

    Task<(bool Ok, bool Conflict)> TryUpdateAsync(Reservation reservation, IEnumerable<ReservationBlock> oldBlocks);

    /// <summary>
    /// Checks whether another ACTIVE reservation (excluding the given one) already uses this board game
    /// on any of the specified block slots for the given date.
    /// </summary>
    Task<bool> HasBoardGameConflictAsync(Guid excludeReservationId, int boardGameId, DateOnly date, IEnumerable<BlockSlot> blocks, CancellationToken ct = default);
}
