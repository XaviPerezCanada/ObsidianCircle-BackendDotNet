using MiProyecto.Domain.Users;

namespace MiProyecto.Application.Users.Services;

public interface IRefreshTokenService
{
    Task<(string AccessToken, string RefreshToken)> GenerateTokenPairAsync(User user, string deviceId, CancellationToken ct);
    Task<(string AccessToken, string RefreshToken)> RefreshTokensAsync(string refreshToken, string deviceId, CancellationToken ct);
    Task RevokeRefreshTokenAsync(string refreshToken, CancellationToken ct);
    Task RevokeAllUserSessionsAsync(string userEmail, CancellationToken ct);
    Task RevokeDeviceSessionAsync(string userEmail, string deviceId, CancellationToken ct);
}