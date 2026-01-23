using Microsoft.EntityFrameworkCore;
using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Domain.BoardGames.Entities;
using MiProyecto.Infrastructure.GameRooms.Repositories;

namespace MiProyecto.Infrastructure.BoardGames.Repositories;

public class SqlBoardGameRepository : IBoardGameRepository
{
    private readonly SqlServerDbContext _db;
    public SqlBoardGameRepository(SqlServerDbContext db) => _db = db;

    public async Task AddAsync(BoardGame game, CancellationToken ct = default)
        => await _db.BoardGames.AddAsync(game, ct);

    public Task<BoardGame?> GetByIdAsync(int id, CancellationToken ct = default)
        => _db.BoardGames.FirstOrDefaultAsync(x => x.Id == id, ct);
}
