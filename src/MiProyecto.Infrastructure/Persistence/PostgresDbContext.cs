using Microsoft.EntityFrameworkCore;
using MiProyecto.Domain.BoardGames.Entities;
using MiProyecto.Domain.GameRooms.Entities;
using MiProyecto.Domain.Reservation.Entities;
using MiProyecto.Domain.Users;

public class PostgresDbContext : DbContext
{
    public PostgresDbContext(DbContextOptions<PostgresDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<BoardGame> BoardGames => Set<BoardGame>();
    public DbSet<GameRoom> GameRooms => Set<GameRoom>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<ReservationBlock> ReservationBlocks => Set<ReservationBlock>();
    public DbSet<RefreshSession> RefreshSessions { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PostgresDbContext).Assembly);

        modelBuilder.Entity<Reservation>(b =>
        {
            b.ToTable("reservations");
            b.HasKey(x => x.Id);

            b.Property(x => x.Slug).IsRequired().HasMaxLength(32);
            b.HasIndex(x => x.Slug).IsUnique();

            b.Property(x => x.Date).HasColumnType("date");

            b.HasMany(x => x.Blocks)
             .WithOne()
             .HasForeignKey("ReservationId")
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ReservationBlock>(b =>
        {
            b.ToTable("reservation_blocks");
            b.HasKey(x => x.Id);

            b.Property(x => x.Date).HasColumnType("date");

            b.HasIndex(x => new { x.GameRoomId, x.Date, x.Bloque })
             .IsUnique();
        });

        modelBuilder.Entity<BoardGame>(b =>
        {
            b.ToTable("board_games");
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.Slug).IsUnique();
        });

        // La configuración de User ahora está en UserConfiguration.cs
        // que se aplica automáticamente mediante ApplyConfigurationsFromAssembly
    }
}
