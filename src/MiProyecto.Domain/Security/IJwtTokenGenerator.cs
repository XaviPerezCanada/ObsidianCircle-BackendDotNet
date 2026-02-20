
using MiProyecto.Domain.Users;

namespace MiProyecto.Domain.Security
{
    public interface IJwtTokenGenerator
    {
         string CreateToken(User user);
    }
}
