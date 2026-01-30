using Microsoft.EntityFrameworkCore;
using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Domain.BoardGames.Entities;


namespace MiProyecto.Infrastructure.BoardGames.Repositories;

public class BoardGameRepository : IBoardGameRepository
{
    private readonly PostgresDbContext _db;
    public BoardGameRepository(PostgresDbContext db) => _db = db;

    public async Task AddAsync(BoardGame game, CancellationToken ct = default)
        => await _db.BoardGames.AddAsync(game, ct);

    public Task<BoardGame?> GetByIdAsync(int id, CancellationToken ct = default)
        => _db.BoardGames.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<bool> ExistsAsync(int id)
      => await _db.BoardGames.AnyAsync(g => g.Id == id);
}

