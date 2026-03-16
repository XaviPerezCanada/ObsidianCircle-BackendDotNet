using Microsoft.EntityFrameworkCore;
using MiProyecto.Application.Subscriptions.Interfaces;
using MiProyecto.Domain.Subscriptions;

namespace MiProyecto.Infrastructure.Subscriptions;

public class PlanRepository : IPlanRepository
{
    private readonly PostgresDbContext _db;

    public PlanRepository(PostgresDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<Plan>> GetActiveAsync(CancellationToken ct = default)
        => await _db.Plans.AsNoTracking()
            .Where(p => p.Activo)
            .OrderBy(p => p.PrecioCent)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Plan>> GetAllAsync(CancellationToken ct = default)
        => await _db.Plans.AsNoTracking()
            .OrderBy(p => p.Nombre)
            .ToListAsync(ct);

    public async Task<Plan?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await _db.Plans.FirstOrDefaultAsync(p => p.Slug == slug, ct);

    public async Task<Plan?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _db.Plans.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task AddAsync(Plan plan, CancellationToken ct = default)
    {
        await _db.Plans.AddAsync(plan, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Plan plan, CancellationToken ct = default)
    {
        _db.Plans.Update(plan);
        await _db.SaveChangesAsync(ct);
    }
}

