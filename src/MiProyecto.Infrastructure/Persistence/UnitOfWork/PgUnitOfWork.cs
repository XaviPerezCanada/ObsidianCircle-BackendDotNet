using MiProyecto.Application.Interfaces;
using MiProyecto.Infrastructure.Persistence.UnitOfWork;

namespace MiProyecto.Infrastructure.Persistence.UnitOfWork;

public class PgUnitOfWork : IPgUnitOfWork
{
    private readonly PostgresDbContext _db;

    public PgUnitOfWork(PostgresDbContext db)
    {
        _db = db;
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
        => _db.SaveChangesAsync(ct);
}
