namespace MiProyecto.Application.Interfaces;

public interface ISqlUnitOfWork
{
    Task SaveChangesAsync(CancellationToken ct = default);
}
