namespace MiProyecto.Domain.Security;

/// <summary>
/// Interfaz para el servicio de hashing de contraseñas.
/// </summary>
public interface IPasswordHasher
{
    /// <summary>
    /// Genera un hash seguro a partir de una contraseña y un salt.
    /// </summary>
    Task<byte[]> HashAsync(string password, byte[] salt);

    /// <summary>
    /// Genera un salt aleatorio criptográficamente seguro.
    /// </summary>
    byte[] GenerateSalt();
}
