using Microsoft.EntityFrameworkCore;
using MiProyecto.Application.BoardGames.Dtos;
using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Application.Common;
using MiProyecto.Domain.BoardGames.Entities;

namespace MiProyecto.Infrastructure.BoardGames.Repositories;

public class BoardGameRepository : IBoardGameRepository
{
    private readonly PostgresDbContext _db;
    public BoardGameRepository(PostgresDbContext db) => _db = db;

    public async Task AddAsync(BoardGame game, CancellationToken ct = default)
    {
        await _db.BoardGames.AddAsync(game, ct);
        await _db.SaveChangesAsync(ct);
    }

    public Task<BoardGame?> GetByIdAsync(int id, CancellationToken ct = default)
        => _db.BoardGames.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<BoardGame?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => _db.BoardGames.FirstOrDefaultAsync(x => x.Slug == slug, ct);

    public async Task<IEnumerable<BoardGame>> GetAllAsync(CancellationToken ct = default)
        => await _db.BoardGames.ToListAsync(ct);

    public async Task UpdateAsync(BoardGame game, CancellationToken ct = default)
    {
        _db.BoardGames.Update(game);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken ct = default)
        => await _db.BoardGames.AnyAsync(g => g.Id == id, ct);

    public async Task<PagedResult<BoardGame>> SearchAsync(BoardGameSearchParams p)
    {
        IQueryable<BoardGame> q = _db.BoardGames.AsQueryable();

        // Búsqueda por texto (título, slug, descripción, género, editorial)
        if (!string.IsNullOrWhiteSpace(p.Q))
        {
            var like = p.Q.ToLower().Trim();
            q = q.Where(x =>
                (x.Titulo != null && x.Titulo.ToLower().Contains(like)) ||
                (x.Slug != null && x.Slug.ToLower().Contains(like)) ||
                (x.Descripcion != null && x.Descripcion.ToLower().Contains(like)) ||
                (x.Genero != null && x.Genero.ToLower().Contains(like)) ||
                (x.Editorial != null && x.Editorial.ToLower().Contains(like)));
        }

        // Filtro por número de jugadores: juegos que admitan al menos N jugadores
        if (p.Jugadores.HasValue && p.Jugadores.Value > 0)
        {
            var n = p.Jugadores.Value;
            q = q.Where(x => x.JugadoresMin <= n && n <= x.JugadoresMax);
        }

        // Ordenación
        q = (p.Sort ?? "") switch
        {
            "titulo_asc" => q.OrderBy(x => x.Titulo).ThenBy(x => x.Id),
            "titulo_desc" => q.OrderByDescending(x => x.Titulo).ThenBy(x => x.Id),
            _ => q.OrderBy(x => x.Id)
        };

        var total = await q.CountAsync();
        var items = await q
            .Skip((p.Page - 1) * p.Limit)
            .Take(p.Limit)
            .ToListAsync();

        return new PagedResult<BoardGame>(items, p.Page, p.Limit, total);
    }

    public async Task<IEnumerable<BoardGame>> GetBySocioAsync(string socio, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(socio))
        {
            return Array.Empty<BoardGame>();
        }

        return await _db.BoardGames
            .Where(g => g.Socio == socio)
            .ToListAsync(ct);
    }
}

