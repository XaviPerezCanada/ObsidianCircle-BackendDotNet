using MiProyecto.Application.Users;


namespace MiProyecto.Infrastructure.Users
{
    public class UserHandler : IUserHandler
    {
        public Task<UserDto> CreateAsync(NewUserDto input, CancellationToken ct)
        {
            var slug = input.Username.Trim().ToLowerInvariant().Replace(" ", "-");
            const string type = "BASICO";

            return Task.FromResult(new UserDto(
                Email: input.Email,
                Username: input.Username,
                Slug: slug,
                Type: type,
                Token: "fake-jwt-token",
                Bio: null,
                Image: null
            ));
        }
        public Task<UserDto> LoginAsync(LoginUserDto input, CancellationToken ct)
        {
            const string username = "username";
            var slug = username.Trim().ToLowerInvariant().Replace(" ", "-");
            const string type = "BASICO";

            return Task.FromResult(new UserDto(
                Email: input.Email,
                Username: username,
                Slug: slug,
                Type: type,
                Token: "fake-jwt-token",
                Bio: null,
                Image: null
            ));
        }

    }
}
