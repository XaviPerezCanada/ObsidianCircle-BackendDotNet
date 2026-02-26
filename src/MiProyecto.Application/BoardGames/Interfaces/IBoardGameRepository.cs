using MiProyecto.Application.Common;
using MiProyecto.Application.BoardGames.Dtos;
using MiProyecto.Domain.BoardGames.Entities;

namespace MiProyecto.Application.BoardGames.Interfaces;

public interface IBoardGameRepository
{
    Task AddAsync(BoardGame game, CancellationToken ct = default);
    Task<BoardGame?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<BoardGame?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<IEnumerable<BoardGame>> GetAllAsync(CancellationToken ct = default);
    Task UpdateAsync(BoardGame game, CancellationToken ct = default);
    Task<bool> ExistsAsync(int id, CancellationToken ct = default);
    Task<PagedResult<BoardGame>> SearchAsync(BoardGameSearchParams p);
    /// <summary>
    /// Devuelve todos los juegos asociados a un socio/usuario concreto.
    /// Normalmente se corresponderá con el nombre de usuario que se guarda en la propiedad Socio.
    /// </summary>
    Task<IEnumerable<BoardGame>> GetBySocioAsync(string socio, CancellationToken ct = default);
}

