

using System.ComponentModel.DataAnnotations;

namespace MiProyecto.Application.Users
{
    public record NewUserDto(
       [Required, EmailAddress] string Email,
       [Required] string Username,
       [Required] string Password
   );

    public record LoginUserDto(
        [Required, EmailAddress] string Email,
        [Required] string Password
    );

        public record UserDto(
         string Email,
         string Username,
         string Slug,
         string Type,
         string Token,
         string? Bio,
         string? Image
     );

    public record UserProfileDto(
        string Email,
        string Username,
        string Slug,
        string Type,
        string? Bio,
        string? Image
    );
}
