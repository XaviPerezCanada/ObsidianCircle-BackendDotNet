using MiProyecto.Application.Common;
using MiProyecto.Application.BoardGames.Dtos;
using MiProyecto.Domain.BoardGames.Entities;

namespace MiProyecto.Application.BoardGames.Interfaces;

public interface IBoardGameRepository
{
    Task AddAsync(BoardGame game, CancellationToken ct = default);
    Task<BoardGame?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<BoardGame>> GetAllAsync(CancellationToken ct = default);
    Task<bool> ExistsAsync(int id, CancellationToken ct = default);
    Task<PagedResult<BoardGame>> SearchAsync(BoardGameSearchParams p);
}

