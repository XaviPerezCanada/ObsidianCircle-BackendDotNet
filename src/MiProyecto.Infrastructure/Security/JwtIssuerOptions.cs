using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace MiProyecto.Infrastructure.Security
{
    public class JwtIssuerOptions
    {
        public const string Schemes = "Bearer";
        public string? Issuer { get; set; }
        public string? Subject { get; set; }
        public string? Audience { get; set; }

       
        public string SecretKey { get; set; } = string.Empty;

        public DateTime NotBefore => DateTime.UtcNow;
        public DateTime IssuedAt => DateTime.UtcNow;
        public TimeSpan ValidFor { get; set; } = TimeSpan.FromMinutes(5);
        public DateTime Expiration => IssuedAt.Add(ValidFor);
        public Func<string> JtiGenerator => () => Guid.NewGuid().ToString();

 
        public SigningCredentials SigningCredentials
        {
            get
            {
                if (string.IsNullOrEmpty(SecretKey))
                    throw new InvalidOperationException("JWT SecretKey no configurada.");

                
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
                return new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            }
        }
    }
}