using MiProyecto.Application.Interfaces;
using MiProyecto.Infrastructure.Persistence;

namespace MiProyecto.Infrastructure.Persistence.UnitOfWork;

public class SqlUnitOfWork : ISqlUnitOfWork
{
    private readonly SqlServerDbContext _db;

    public SqlUnitOfWork(SqlServerDbContext db)
    {
        _db = db;
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
        => _db.SaveChangesAsync(ct);
}
