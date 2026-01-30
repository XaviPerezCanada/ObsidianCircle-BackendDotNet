using Microsoft.EntityFrameworkCore;
using MiProyecto.Application.Reservations.Interfaces;
using MiProyecto.Domain.Reservation.Entities;
using Npgsql;

namespace MiProyecto.Infrastructure.Reservations.Repositories;

public sealed class ReservationRepository : IReservationRepository
{
    private readonly PostgresDbContext _db;

    public ReservationRepository(PostgresDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(Reservation reservation)
    {
        await _db.Reservations.AddAsync(reservation);
        await _db.SaveChangesAsync();
    }

    public async Task<Reservation?> GetByIdAsync(Guid id)
    {
        return await _db.Reservations
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Reservation?> GetByIdWithBlocksAsync(Guid id)
    {
        return await _db.Reservations
            .Include(r => r.Blocks)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task UpdateAsync(Reservation reservation)
    {
        _db.Reservations.Update(reservation);
        await _db.SaveChangesAsync();
    }

    public async Task RemoveBlocksAsync(IEnumerable<ReservationBlock> blocks)
    {
        _db.ReservationBlocks.RemoveRange(blocks);
        await _db.SaveChangesAsync();
    }
    public async Task<(bool Ok, bool Conflict)> TryAddAsync(Reservation reservation)
    {
        try
        {
            await _db.Reservations.AddAsync(reservation);
            await _db.SaveChangesAsync();
            return (true, false);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg && pg.SqlState == "23505")
        {
            
            return (false, true);
        }
    }
}
