using MiProyecto.Application.Users.DTOs;

namespace MiProyecto.Application.Users.Services;

public interface IAuthHandler
{
    Task<AuthResult> CreateAsync(NewUserDto input, string deviceId, CancellationToken ct);
    Task<AuthResult> LoginAsync(LoginUserDto input, string deviceId, CancellationToken ct);
}