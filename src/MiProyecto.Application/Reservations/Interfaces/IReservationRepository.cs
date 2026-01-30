using MiProyecto.Domain.Reservation.Entities;

namespace MiProyecto.Application.Reservations.Interfaces;

public interface IReservationRepository
{
    Task<(bool Ok, bool Conflict)> TryAddAsync(Reservation reservation);

    Task AddAsync(Reservation reservation);

    Task<Reservation?> GetByIdAsync(Guid id);

    Task<Reservation?> GetByIdWithBlocksAsync(Guid id);

    Task UpdateAsync(Reservation reservation);

    Task RemoveBlocksAsync(IEnumerable<ReservationBlock> blocks);
}
