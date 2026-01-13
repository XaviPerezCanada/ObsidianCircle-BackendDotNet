using Microsoft.EntityFrameworkCore;
using MiProyecto.Domain.BoardGames.Entities;

public class PostgresDbContext : DbContext
{
    public PostgresDbContext(DbContextOptions<PostgresDbContext> options) : base(options) { }

    public DbSet<BoardGame> Loans => Set<BoardGame>(); // POR AHORA HAY BOARDGAMES -> PERO HAY QUE CAMBIAR A OTRA COSA

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PostgresDbContext).Assembly);
    }
}
