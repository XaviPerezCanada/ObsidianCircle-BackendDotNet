using Microsoft.EntityFrameworkCore;
using MiProyecto.Application.Reservations.Interfaces;
using MiProyecto.Domain.Reservation;
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

    public async Task<Reservation?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        return await _db.Reservations
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Slug == slug, ct);
    }

    public async Task<Reservation?> GetByIdWithBlocksAsync(Guid id)
    {
        return await _db.Reservations
            .Include(r => r.Blocks)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Reservation?> GetBySlugWithBlocksAsync(string slug, CancellationToken ct = default)
    {
        return await _db.Reservations
            .Include(r => r.Blocks)
            .FirstOrDefaultAsync(r => r.Slug == slug, ct);
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
        var blocksToLock = GetBlockSlotsFor(reservation.Franja).ToList();
        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            // Bloqueo pesimista: advisory lock por (sala, fecha, bloque) para serializar reservas del mismo slot
            foreach (var block in blocksToLock)
            {
                var lockKey = GetAdvisoryLockKey(reservation.GameRoomId, reservation.Date, block);
                await _db.Database.ExecuteSqlRawAsync(
                    "SELECT pg_advisory_xact_lock({0})",
                    lockKey);
            }

            // SELECT ... FOR UPDATE: bloquear filas del recurso (reservation_blocks) en Postgres antes de comprobar/insertar
            var bloqueParams = string.Join(", ", blocksToLock.Select((_, i) => "{" + (i + 2) + "}"));
            var forUpdateParams = new object[] { reservation.GameRoomId, reservation.Date }
                .Concat(blocksToLock.Select(b => (object)(int)b))
                .ToArray();
            await _db.Database.ExecuteSqlRawAsync(
                $@"SELECT 1 FROM reservation_blocks WHERE ""GameRoomId"" = {{0}} AND ""Date"" = {{1}} AND ""Bloque"" IN ({bloqueParams}) FOR UPDATE",
                forUpdateParams);

            // Comprobar si ya existe alguna reserva ACTIVA que ocupe estos bloques (las canceladas no cuentan)
            var exists = await (
                from b in _db.ReservationBlocks
                join r in _db.Reservations on b.ReservationId equals r.Id
                where b.GameRoomId == reservation.GameRoomId
                      && b.Date == reservation.Date
                      && blocksToLock.Contains(b.Bloque)
                      && r.Estado == ReservationStatus.Active
                select b
            ).AnyAsync();

            if (exists)
            {
                await transaction.RollbackAsync();
                return (false, true);
            }

            await _db.Reservations.AddAsync(reservation);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
            return (true, false);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg && pg.SqlState == "23505")
        {
            await transaction.RollbackAsync();
            return (false, true);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static long GetAdvisoryLockKey(Guid gameRoomId, DateOnly date, BlockSlot block)
    {
        var hash = HashCode.Combine(gameRoomId, date, block);
        return (long)(uint)hash;
    }

    private static IEnumerable<BlockSlot> GetBlockSlotsFor(TimeSlot franja) => franja switch
    {
        TimeSlot.Morning => new[] { BlockSlot.Morning },
        TimeSlot.Afternoon => new[] { BlockSlot.Afternoon },
        TimeSlot.Night => new[] { BlockSlot.Night },
        TimeSlot.FullDay => new[] { BlockSlot.Morning, BlockSlot.Afternoon, BlockSlot.Night },
        _ => throw new ArgumentOutOfRangeException(nameof(franja))
    };

    public async Task<IReadOnlyList<Reservation>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        return await _db.Reservations
            .AsNoTracking()
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.Date)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Reservation>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Reservations
            .AsNoTracking()
            .OrderByDescending(r => r.Date)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Reservation>> GetByDateAndRoomAsync(DateOnly date, Guid gameRoomId, CancellationToken ct = default)
    {
        return await _db.Reservations
            .AsNoTracking()
            .Where(r => r.Date == date && r.GameRoomId == gameRoomId)
            .OrderBy(r => r.Franja)
            .ToListAsync(ct);
    }

    public async Task<(bool Ok, bool Conflict)> TryUpdateAsync(Reservation reservation, IEnumerable<ReservationBlock> oldBlocks)
    {
        var blocksToLock = GetBlockSlotsFor(reservation.Franja).ToList();
        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            // Pessimistic advisory locks on new blocks
            foreach (var block in blocksToLock)
            {
                var lockKey = GetAdvisoryLockKey(reservation.GameRoomId, reservation.Date, block);
                await _db.Database.ExecuteSqlRawAsync(
                    "SELECT pg_advisory_xact_lock({0})",
                    lockKey);
            }

            // Check for room/slot conflicts excluding this reservation
            var exists = await (
                from b in _db.ReservationBlocks
                join r in _db.Reservations on b.ReservationId equals r.Id
                where b.GameRoomId == reservation.GameRoomId
                      && b.Date == reservation.Date
                      && blocksToLock.Contains(b.Bloque)
                      && r.Estado == ReservationStatus.Active
                      && r.Id != reservation.Id
                select b
            ).AnyAsync();

            if (exists)
            {
                await transaction.RollbackAsync();
                return (false, true);
            }

            // Explicitly manage entity states to avoid the concurrency issue:
            // - Old blocks must be Deleted (they exist in DB but were removed from collection)
            // - New blocks must be Added (they don't exist in DB yet)
            // - The reservation itself is already tracked as Modified by EF change tracker
            // We can't use _db.Update() because it marks ALL entities as Modified,
            // including the new blocks which would generate UPDATE instead of INSERT.
            foreach (var oldBlock in oldBlocks)
                _db.Entry(oldBlock).State = Microsoft.EntityFrameworkCore.EntityState.Deleted;

            foreach (var newBlock in reservation.Blocks)
                _db.Entry(newBlock).State = Microsoft.EntityFrameworkCore.EntityState.Added;

            await _db.SaveChangesAsync();

            await transaction.CommitAsync();
            return (true, false);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg && pg.SqlState == "23505")
        {
            await transaction.RollbackAsync();
            return (false, true);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> HasBoardGameConflictAsync(
        Guid excludeReservationId,
        int boardGameId,
        DateOnly date,
        IEnumerable<BlockSlot> blocks,
        CancellationToken ct = default)
    {
        var blockList = blocks.ToList();

        return await (
            from r in _db.Reservations
            join b in _db.ReservationBlocks on r.Id equals b.ReservationId
            where r.Id != excludeReservationId
                  && r.Estado == ReservationStatus.Active
                  && r.BoardGameId == boardGameId
                  && b.Date == date
                  && blockList.Contains(b.Bloque)
            select r
        ).AnyAsync(ct);
    }
}
