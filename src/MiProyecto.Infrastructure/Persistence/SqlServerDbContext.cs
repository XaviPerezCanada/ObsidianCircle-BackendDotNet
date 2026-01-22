using Microsoft.EntityFrameworkCore;
using MiProyecto.Domain.BoardGames.Entities;
using MiProyecto.Domain.GameRooms.Entities;

public class SqlServerDbContext : DbContext
{
    public SqlServerDbContext(DbContextOptions<SqlServerDbContext> options) : base(options) { }

    public DbSet<BoardGame> BoardGames => Set<BoardGame>();
    public DbSet<GameRoom> GameRooms => Set<GameRoom>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SqlServerDbContext).Assembly);
    }
}
