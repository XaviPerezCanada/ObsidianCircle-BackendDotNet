using MiProyecto.Application.BoardGames.Dtos;
using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Application.Common;
using MiProyecto.Domain.BoardGames.Entities;

namespace MiProyecto.Application.BoardGames.Services;

public class BoardGameService
{
    private readonly IBoardGameRepository _repository;

    public BoardGameService(IBoardGameRepository repository)
    {
        _repository = repository;
    }

    /// <summary>
    /// Obtiene todos los juegos de mesa.
    /// </summary>
    public async Task<IEnumerable<BoardGameDto>> GetAllAsync()
    {
        var games = await _repository.GetAllAsync();
        return games.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Búsqueda paginada de juegos por texto, número de jugadores y ordenación.
    /// </summary>
    public async Task<PagedResult<BoardGameDto>> SearchAsync(BoardGameSearchParams p)
    {
        var paged = await _repository.SearchAsync(p);
        var items = paged.Items.Select(MapToDto).ToList();
        return new PagedResult<BoardGameDto>(items, paged.Page, paged.PageSize, paged.TotalCount);
    }

    private static BoardGameDto MapToDto(BoardGame g)
    {
        return new BoardGameDto(
            g.Id,
            g.Titulo,
            g.Slug,
            g.Socio,
            g.Editorial,
            g.Genero,
            g.JugadoresMin,
            g.JugadoresMax,
            g.EdadRecomendada,
            g.DuracionMinutos,
            g.Categoria,
            g.Ubicacion,
            g.Idioma,
            g.ImagenUrl,
            g.Observaciones,
            g.Estado,
            g.Disponibilidad,
            g.FechaRegistro,
            g.FechaUltimaModificacion
            );
    }
}
