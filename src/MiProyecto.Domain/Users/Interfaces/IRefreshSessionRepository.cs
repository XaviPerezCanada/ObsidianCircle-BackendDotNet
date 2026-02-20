using MiProyecto.Domain.Users;

namespace MiProyecto.Domain.Users.Interfaces;

public interface IRefreshSessionRepository 
  
{
    Task<RefreshSession?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default);
    Task<RefreshSession?> GetByFamilyIdAsync(Guid familyId, CancellationToken ct = default);
    Task<IEnumerable<RefreshSession>> GetByUserEmailAsync(string userEmail, CancellationToken ct = default);
    Task<IEnumerable<RefreshSession>> GetByDeviceIdAsync(string userEmail, string deviceId, CancellationToken ct = default);
    Task AddAsync(RefreshSession session, CancellationToken ct = default);
    Task UpdateAsync(RefreshSession session, CancellationToken ct = default);
    Task RevokeByFamilyIdAsync(Guid familyId, CancellationToken ct = default);
    Task RevokeByDeviceIdAsync(string userEmail, string deviceId, CancellationToken ct = default);
    Task RevokeAllByUserEmailAsync(string userEmail, CancellationToken ct = default);
    Task DeleteExpiredSessionsAsync(TimeSpan maxAge, CancellationToken ct = default);
}