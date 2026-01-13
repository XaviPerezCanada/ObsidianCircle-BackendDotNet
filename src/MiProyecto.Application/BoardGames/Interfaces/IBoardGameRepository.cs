using MiProyecto.Domain.BoardGames.Entities;

namespace MiProyecto.Application.BoardGames.Interfaces;

public interface IBoardGameRepository
{
    Task AddAsync(BoardGame game, CancellationToken ct = default);
    Task<BoardGame?> GetByIdAsync(int id, CancellationToken ct = default);
}

