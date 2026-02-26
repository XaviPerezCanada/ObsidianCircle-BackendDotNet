using System.Security.Cryptography;
using System.Text;
using MiProyecto.Application.Users.DTOs;
using MiProyecto.Application.Users.Exceptions;  
using MiProyecto.Domain.Security;
using MiProyecto.Domain.Users;
using MiProyecto.Domain.Users.Interfaces;


namespace MiProyecto.Application.Users.Services;

public class RefreshTokenService(
    IJwtTokenGenerator jwtTokenGenerator,
    IRefreshSessionRepository refreshSessionRepository,
    IUserRepository userRepository) : IRefreshTokenService
{
    private const int RefreshTokenLength = 64;

    public async Task<(string AccessToken, string RefreshToken)> GenerateTokenPairAsync(
        User user, 
        string deviceId, 
        CancellationToken ct)
    {
        // Generar nuevo family_id para esta sesión
        var familyId = Guid.NewGuid();
        
        // Generar refresh token aleatorio
        var refreshToken = GenerateSecureRandomToken();
        var tokenHash = HashToken(refreshToken);

        // Crear sesión
        var session = new RefreshSession(
            userEmail: user.Email,
            deviceId: deviceId,
            familyId: familyId,
            currentTokenHash: tokenHash,
            sessionVersion: user.SessionVersion
        );

        await refreshSessionRepository.AddAsync(session, ct);

        // Generar access token
        var accessToken = jwtTokenGenerator.CreateToken(user);

        return (accessToken, refreshToken);
    }

    public async Task<(string AccessToken, string RefreshToken, UserDto User)> RefreshTokensAsync(
        string refreshToken, 
        string deviceId, 
        CancellationToken ct)
    {
        var tokenHash = HashToken(refreshToken);
        var session = await refreshSessionRepository.GetByTokenHashAsync(tokenHash, ct);

        if (session == null)
            throw new InvalidRefreshTokenException("Refresh token no encontrado");

        // Verificar que el usuario existe y obtener su versión actual
        var user = await userRepository.GetByEmailAsync(session.UserEmail, ct);
        if (user == null)
            throw new InvalidRefreshTokenException("Usuario no encontrado");

        // Verificar versión de sesión (revocación global)
        if (!session.IsValidForVersion(user.SessionVersion))
            throw new InvalidRefreshTokenException("Sesión invalidada por cambio de versión");

        // Verificar que no esté revocada
        if (session.Revoked)
            throw new InvalidRefreshTokenException("Refresh token revocado");

        // Verificar device_id
        if (session.DeviceId != deviceId)
        {
            // Posible robo de token - revocar toda la familia
            await refreshSessionRepository.RevokeByFamilyIdAsync(session.FamilyId, ct);
            throw new InvalidRefreshTokenException("Dispositivo no coincide - sesión revocada por seguridad");
        }

        // Verificar si el token ya fue usado (one-time use)
        // Si encontramos otra sesión con el mismo familyId pero diferente tokenHash,
        // significa que ya se rotó (reuse detection)
        var existingSession = await refreshSessionRepository.GetByFamilyIdAsync(session.FamilyId, ct);
        if (existingSession != null && existingSession.CurrentTokenHash != tokenHash)
        {
            // Token reutilizado - revocar toda la familia
            await refreshSessionRepository.RevokeByFamilyIdAsync(session.FamilyId, ct);
            throw new InvalidRefreshTokenException("Token reutilizado - sesión revocada por seguridad");
        }

        // Rotar token (one-time use)
        var newRefreshToken = GenerateSecureRandomToken();
        var newTokenHash = HashToken(newRefreshToken);
        
        session.RotateToken(newTokenHash);
        await refreshSessionRepository.UpdateAsync(session, ct);

        // Generar nuevo access token
        var accessToken = jwtTokenGenerator.CreateToken(user);

        var userDto = new UserDto(
            Username: user.Username,
            Email: user.Email,
            Slug: user.Slug.Value,
            Type: user.Type.Value,
            Bio: string.IsNullOrWhiteSpace(user.Bio) ? null : user.Bio,
            Image: string.IsNullOrWhiteSpace(user.Image) ? null : user.Image
        );

        return (accessToken, newRefreshToken, userDto);
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken, CancellationToken ct)
    {
        var tokenHash = HashToken(refreshToken);
        var session = await refreshSessionRepository.GetByTokenHashAsync(tokenHash, ct);
        
        if (session != null)
        {
            await refreshSessionRepository.RevokeByFamilyIdAsync(session.FamilyId, ct);
        }
    }

    public async Task RevokeAllUserSessionsAsync(string userEmail, CancellationToken ct)
    {
        var user = await userRepository.GetByEmailAsync(userEmail, ct);
        if (user != null)
        {
            user.IncrementSessionVersion();
            await userRepository.UpdateAsync(user, ct);
        }
        await refreshSessionRepository.RevokeAllByUserEmailAsync(userEmail, ct);
    }

    public async Task RevokeDeviceSessionAsync(string userEmail, string deviceId, CancellationToken ct)
    {
        await refreshSessionRepository.RevokeByDeviceIdAsync(userEmail, deviceId, ct);
    }

    private static string GenerateSecureRandomToken()
    {
        var bytes = new byte[RefreshTokenLength];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }

    private static string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(hashBytes);
    }
}