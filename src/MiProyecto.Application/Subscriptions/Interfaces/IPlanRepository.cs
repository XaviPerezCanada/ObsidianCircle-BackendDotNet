using MiProyecto.Domain.Subscriptions;

namespace MiProyecto.Application.Subscriptions.Interfaces;

public interface IPlanRepository
{
    Task<IReadOnlyList<Plan>> GetActiveAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Plan>> GetAllAsync(CancellationToken ct = default);
    Task<Plan?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<Plan?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(Plan plan, CancellationToken ct = default);
    Task UpdateAsync(Plan plan, CancellationToken ct = default);
}

