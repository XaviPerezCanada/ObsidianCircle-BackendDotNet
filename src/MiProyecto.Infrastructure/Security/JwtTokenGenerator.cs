using Microsoft.Extensions.Options;
using MiProyecto.Domain.Users;
using MiProyecto.Domain.Security;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;


namespace MiProyecto.Infrastructure.Security
{
    public class JwtTokenGenerator(IOptions<JwtIssuerOptions> jwtOptions) : IJwtTokenGenerator
    {
        private readonly JwtIssuerOptions _jwtOptions = jwtOptions.Value;

        public string CreateToken(User user)
        {
            var claims = new[]
            {
        new Claim(JwtRegisteredClaimNames.Sub, user.Username),
        new Claim(JwtRegisteredClaimNames.Email, user.Email), 
        new Claim(JwtRegisteredClaimNames.Jti, _jwtOptions.JtiGenerator()),
        new Claim(
            JwtRegisteredClaimNames.Iat,
            new DateTimeOffset(_jwtOptions.IssuedAt).ToUnixTimeSeconds().ToString(),
            ClaimValueTypes.Integer64
        ),
    };
            var jwt = new JwtSecurityToken(
                _jwtOptions.Issuer,
                _jwtOptions.Audience,
                claims,
                _jwtOptions.NotBefore,
                _jwtOptions.Expiration,
                _jwtOptions.SigningCredentials
            );

            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);
            return encodedJwt;
        }
    }
}
