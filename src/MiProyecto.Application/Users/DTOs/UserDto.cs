

namespace MiProyecto.Application.Users.DTOs
{
    // Peticiones básicas
    public record NewUserDto(string Username, string Email, string Password);
    
    public record LoginUserDto(string Email, string Password);

    public record UpdateUserDto(string? Username, string? Email, string? Password, string? Bio, string? Image);

    // Admin
    public record AdminUpdateUserDto(string? Username, string? Email, string? Bio, string? Image, string? Type, bool? Active);
    public record AdminUserDto(string Username, string Email, string Slug, string Type, string Status, string? Bio, string? Image);

   
    public record UserDto(string Username, string Email, string Slug, string Type, string? Bio, string? Image);

   
    public record RefreshTokenDto(string RefreshToken, string DeviceId);
    
    public record TokenPairDto(string AccessToken, string RefreshToken);

  
    public record AuthResponseDto( string AccessToken , UserDto User);

    public record AuthResult(
    UserDto User,
    string AccessToken,
    string RefreshToken
);
}

