using System.Security.Cryptography;
using System.Text;

namespace MiProyecto.Application.Common;

/// <summary>
/// Genera un Guid determinista a partir del email del usuario,
/// para poder filtrar reservas por "usuario actual" cuando User tiene Email como PK.
/// El cliente debe usar este mismo Guid al crear reservas (p. ej. obteniéndolo del perfil).
/// </summary>
public static class UserIdFromEmail
{
    private static readonly Guid Namespace = new("6ba7b810-9dad-11d1-80b4-00c04fd430c8");

    public static Guid ToGuid(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("El email no puede estar vacío.", nameof(email));

        var bytes = Encoding.UTF8.GetBytes(email.Trim().ToLowerInvariant());
        var hash = SHA256.HashData(bytes);
        var guidBytes = new byte[16];
        Array.Copy(hash, 0, guidBytes, 0, 16);
        return new Guid(guidBytes);
    }
}
