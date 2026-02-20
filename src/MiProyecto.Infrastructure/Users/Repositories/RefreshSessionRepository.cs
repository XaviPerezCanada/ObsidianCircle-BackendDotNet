using Microsoft.EntityFrameworkCore;
using MiProyecto.Domain.Users;
using MiProyecto.Domain.Users.Interfaces;

namespace MiProyecto.Infrastructure.Users.Repositories;

public class RefreshSessionRepository : IRefreshSessionRepository
{
    private readonly PostgresDbContext _db;

    public RefreshSessionRepository(PostgresDbContext db)
    {
        _db = db;
    }

    public async Task<RefreshSession?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default)
    {
        return await _db.RefreshSessions
            .FirstOrDefaultAsync(s => s.CurrentTokenHash == tokenHash, ct);
    }

    public async Task<RefreshSession?> GetByFamilyIdAsync(Guid familyId, CancellationToken ct = default)
    {
        return await _db.RefreshSessions
            .FirstOrDefaultAsync(s => s.FamilyId == familyId && !s.Revoked, ct);
    }

    public async Task<IEnumerable<RefreshSession>> GetByUserEmailAsync(string userEmail, CancellationToken ct = default)
    {
        return await _db.RefreshSessions
            .Where(s => s.UserEmail == userEmail)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<RefreshSession>> GetByDeviceIdAsync(string userEmail, string deviceId, CancellationToken ct = default)
    {
        return await _db.RefreshSessions
            .Where(s => s.UserEmail == userEmail && s.DeviceId == deviceId)
            .ToListAsync(ct);
    }

    public async Task AddAsync(RefreshSession session, CancellationToken ct = default)
    {
        await _db.RefreshSessions.AddAsync(session, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(RefreshSession session, CancellationToken ct = default)
    {
        _db.RefreshSessions.Update(session);
        await _db.SaveChangesAsync(ct);
    }

    public async Task RevokeByFamilyIdAsync(Guid familyId, CancellationToken ct = default)
    {
        var sessions = await _db.RefreshSessions
            .Where(s => s.FamilyId == familyId)
            .ToListAsync(ct);
        
        foreach (var session in sessions)
        {
            session.Revoke();
        }
        
        await _db.SaveChangesAsync(ct);
    }

    public async Task RevokeByDeviceIdAsync(string userEmail, string deviceId, CancellationToken ct = default)
    {
        var sessions = await _db.RefreshSessions
            .Where(s => s.UserEmail == userEmail && s.DeviceId == deviceId)
            .ToListAsync(ct);
        
        foreach (var session in sessions)
        {
            session.Revoke();
        }
        
        await _db.SaveChangesAsync(ct);
    }

    public async Task RevokeAllByUserEmailAsync(string userEmail, CancellationToken ct = default)
    {
        var sessions = await _db.RefreshSessions
            .Where(s => s.UserEmail == userEmail)
            .ToListAsync(ct);
        
        foreach (var session in sessions)
        {
            session.Revoke();
        }
        
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteExpiredSessionsAsync(TimeSpan maxAge, CancellationToken ct = default)
    {
        var cutoffDate = DateTime.UtcNow.Subtract(maxAge);
        var expiredSessions = await _db.RefreshSessions
            .Where(s => s.LastUsedAt < cutoffDate)
            .ToListAsync(ct);
        
        _db.RefreshSessions.RemoveRange(expiredSessions);
        await _db.SaveChangesAsync(ct);
    }
}