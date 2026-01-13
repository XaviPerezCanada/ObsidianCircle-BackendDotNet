namespace MiProyecto.Application.Interfaces;

public interface IPgUnitOfWork
{
    Task SaveChangesAsync(CancellationToken ct = default);
}
