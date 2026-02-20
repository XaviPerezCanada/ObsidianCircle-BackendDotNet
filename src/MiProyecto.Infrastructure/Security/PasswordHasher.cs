using System.Security.Cryptography;
using MiProyecto.Domain.Security;

namespace MiProyecto.Infrastructure.Security;

public class PasswordHasher : IPasswordHasher
{
    private const int Iterations = 350000;
    private const int KeySize = 64;
    private readonly HashAlgorithmName _algorithm = HashAlgorithmName.SHA512;

    // Antes se llamaba 'Hash', ahora debe ser 'HashAsync' para coincidir con la interfaz
    public async Task<byte[]> HashAsync(string password, byte[] salt)
    {
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, _algorithm);
        return await Task.Run(() => pbkdf2.GetBytes(KeySize));
    }

    // Este es el método nuevo que te pide el error
    public byte[] GenerateSalt()
    {
        return RandomNumberGenerator.GetBytes(16);
    }

    // Si tu interfaz aún dice IDisposable, deja este método vacío:
    public void Dispose() { }
}