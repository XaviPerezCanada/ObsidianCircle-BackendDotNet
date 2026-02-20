using Microsoft.EntityFrameworkCore;
using MiProyecto.Domain.Users;
using MiProyecto.Domain.Users.Interfaces;

namespace MiProyecto.Infrastructure.Users.Repositories;

public class UserRepository : IUserRepository
{
    private readonly PostgresDbContext _db;

    public UserRepository(PostgresDbContext db)
    {
        _db = db;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        return await _db.Users
            .FirstOrDefaultAsync(u => u.Email == email, ct);
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default)
    {
        return await _db.Users
            .FirstOrDefaultAsync(u => u.Username == username, ct);
    }

    public async Task AddAsync(User user, CancellationToken ct = default)
    {
        await _db.Users.AddAsync(user, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<bool> ExistsEmailAsync(string email, CancellationToken ct = default)
    {
        return await _db.Users.AnyAsync(u => u.Email == email, ct);
    }

    public async Task UpdateAsync(User user, CancellationToken ct = default)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync(ct);
    }
}