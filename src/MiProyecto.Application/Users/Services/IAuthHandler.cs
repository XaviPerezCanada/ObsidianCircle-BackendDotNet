using MiProyecto.Application.Users.DTOs;

namespace MiProyecto.Application.Users.Services;

public interface IAuthHandler
{
    Task<AuthResponseDto> CreateAsync(NewUserDto input, string deviceId, CancellationToken ct);
    Task<AuthResponseDto> LoginAsync(LoginUserDto input, string deviceId, CancellationToken ct);
}