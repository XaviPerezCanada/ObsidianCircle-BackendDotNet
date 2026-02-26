
using MiProyecto.Domain.BoardGames.Exceptions;
using MiProyecto.Domain.Common.ValueObjects;

namespace MiProyecto.Domain.Users;

public class User
{
    public string Username { get; private set; } = default!;
    public Slug Slug { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public byte[] PasswordHash { get; private set; } = default!;
    public byte[] Salt { get; private set; } = default!;
    public string Bio { get; private set; } = string.Empty;
    public string Image { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }
    public DateTime? ModifiedAt { get; private set; }
    public Status Status { get; private set; }
    public UserType Type { get; private set; } = UserType.Basico;
    public int SessionVersion { get; private set; } = 1;
    public bool IsAvailable => Status.IsActive;

    // Constructor para EF / Rehidratación
    protected User() { }

    // Constructor principal: ahora pide el objeto Slug directamente
    public User(
        string username,
        Slug slug,
        string email,
        byte[] passwordHash, 
        byte[] salt,         
        string bio,
        string image,
        UserType type)
    {
        Username = username;
        Slug = slug ?? throw new ArgumentNullException(nameof(slug));
        Email = email;
        PasswordHash = passwordHash;
        Salt = salt;
        Bio = bio;
        Image = image;
        CreatedAt = DateTime.UtcNow;
        Status = Status.Active;
        Type = type;
    }

    // El Factory Method que usa tu Mapper
    public static User CreateBasic(string username, string email, byte[] passwordHash, byte[] salt)
    {
        
        var slugValue = username.ToLower().Trim().Replace(" ", "-");
        
        return new User(
            username: username,
            slug: new Slug(slugValue), 
            email: email,
            passwordHash: passwordHash,
            salt: salt,
            bio: string.Empty,
            image: string.Empty,
            type: UserType.Basico
        );
    }

    public void SetPassword(byte[] hash, byte[] salt)
    {
        if (hash == null || hash.Length == 0 || salt == null || salt.Length == 0)
            throw new DomainException("El hash y el salt no pueden estar vacíos.");

        PasswordHash = hash;
        Salt = salt;
        UpdateModifiedAt();
    }

    public void Deactivate()
    {
        if (Status.IsInactive) return;
        Status = Status.Inactive;
        UpdateModifiedAt();
    }

    public void Activate()
    {
        if (Status.IsActive) return;
        Status = Status.Active;
        UpdateModifiedAt();
    }

    public void IncrementSessionVersion()
    {
        SessionVersion++;
        UpdateModifiedAt();
    }

    public void UpdateProfile(string? username, string? email, string? bio, string? image)
    {
        if (!string.IsNullOrWhiteSpace(username) && !string.Equals(Username, username, StringComparison.Ordinal))
        {
            Username = username;
            var slugValue = username.ToLower().Trim().Replace(" ", "-");
            Slug = new Slug(slugValue);
        }

        if (!string.IsNullOrWhiteSpace(email) && !string.Equals(Email, email, StringComparison.OrdinalIgnoreCase))
        {
            Email = email;
        }

        if (bio is not null)
        {
            Bio = bio;
        }

        if (image is not null)
        {
            Image = image;
        }

        UpdateModifiedAt();
    }

    private void UpdateModifiedAt() => ModifiedAt = DateTime.UtcNow;
}
