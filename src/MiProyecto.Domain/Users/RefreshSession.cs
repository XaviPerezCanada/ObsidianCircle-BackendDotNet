namespace MiProyecto.Domain.Users;

public class RefreshSession
{
    public Guid Id { get; private set; }
    public string UserEmail { get; private set; } = default!;
    public string DeviceId { get; private set; } = default!;
    public Guid FamilyId { get; private set; }
    public string CurrentTokenHash { get; private set; } = default!;
    public bool Revoked { get; private set; }
    public int SessionVersion { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime LastUsedAt { get; private set; }

    protected RefreshSession() { }

    public RefreshSession(
        string userEmail,
        string deviceId,
        Guid familyId,
        string currentTokenHash,
        int sessionVersion)
    {
        Id = Guid.NewGuid();
        UserEmail = userEmail;
        DeviceId = deviceId;
        FamilyId = familyId;
        CurrentTokenHash = currentTokenHash;
        SessionVersion = sessionVersion;
        Revoked = false;
        CreatedAt = DateTime.UtcNow;
        LastUsedAt = DateTime.UtcNow;
    }

    public void RotateToken(string newTokenHash)
    {
        CurrentTokenHash = newTokenHash;
        LastUsedAt = DateTime.UtcNow;
    }

    public void Revoke()
    {
        Revoked = true;
    }

    public bool IsValidForVersion(int userSessionVersion)
    {
        return !Revoked && SessionVersion == userSessionVersion;
    }
}