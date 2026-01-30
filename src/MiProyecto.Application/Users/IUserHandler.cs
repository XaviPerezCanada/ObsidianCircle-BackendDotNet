
namespace MiProyecto.Application.Users
{
    public interface IUserHandler
    {
        Task<UserDto> CreateAsync(NewUserDto input, CancellationToken ct);
        Task<UserDto> LoginAsync(LoginUserDto input, CancellationToken ct);
    }
}
