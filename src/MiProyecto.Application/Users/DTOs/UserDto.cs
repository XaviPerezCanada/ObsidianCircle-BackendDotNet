

namespace MiProyecto.Application.Users.DTOs
{
    // Peticiones básicas
    public record NewUserDto(string Username, string Email, string Password);
    
    public record LoginUserDto(string Email, string Password);

    public record UpdateUserDto(string? Username, string? Email, string? Password, string? Bio, string? Image);

    // DTO puro de usuario (sin tokens)
    public record UserDto(string Username, string Email, string Slug, string Type, string? Bio, string? Image);

    // DTOs relacionados con autenticación y refresh tokens
    public record RefreshTokenDto(string RefreshToken, string DeviceId);
    
    public record TokenPairDto(string AccessToken, string RefreshToken);

    // Respuesta completa de autenticación (usuario + tokens)
    public record AuthResponseDto(UserDto User, string AccessToken, string RefreshToken);
}

