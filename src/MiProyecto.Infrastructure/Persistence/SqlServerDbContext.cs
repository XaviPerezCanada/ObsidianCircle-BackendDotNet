using Microsoft.EntityFrameworkCore;
using MiProyecto.Domain.BoardGames.Entities;

public class SqlServerDbContext : DbContext
{
    public SqlServerDbContext(DbContextOptions<SqlServerDbContext> options) : base(options) { }

    public DbSet<BoardGame> BoardGames => Set<BoardGame>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SqlServerDbContext).Assembly);
    }
}
