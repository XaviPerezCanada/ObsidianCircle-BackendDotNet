using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.BoardGames.Dtos;
using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Application.BoardGames.Services;
using MiProyecto.Application.BoardGames.UseCases;
using MiProyecto.Application.Common;
using MiProyecto.Domain.BoardGames.Entities;

namespace MiProyecto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardGamesController : ControllerBase
{
    private readonly CreateBoardGameHandler _createHandler;
    private readonly BoardGameService _service;
    private readonly IBoardGameRepository _repository;

    public BoardGamesController(
        CreateBoardGameHandler createHandler,
        BoardGameService service,
        IBoardGameRepository repository)
    {
        _createHandler = createHandler;
        _service = service;
        _repository = repository;
    }

    /// <summary>
    /// Lista todos los juegos de mesa (visible en Swagger).
    /// </summary>
    /// <response code="200">Lista de juegos.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<BoardGameDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BoardGameDto>>> GetAll()
    {
        var games = await _service.GetAllAsync();
        return Ok(games);
    }

    /// <summary>
    /// Búsqueda paginada: ?q=texto&amp;jugadores=4&amp;sort=titulo_asc|titulo_desc&amp;page=1&amp;limit=10
    /// jugadores: juegos que admitan al menos este número de jugadores (string en la URL).
    /// </summary>
    /// <response code="200">Resultado paginado con items, page, pageSize, totalCount.</response>
    [HttpGet("search")]
    [ProducesResponseType(typeof(PagedResult<BoardGameDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<BoardGameDto>>> Search(
        [FromQuery] string? q,
        [FromQuery] string? jugadores,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10)
    {
        int? jugadoresFilter = null;
        if (!string.IsNullOrWhiteSpace(jugadores) && int.TryParse(jugadores.Trim(), out var n) && n > 0)
            jugadoresFilter = n;

        var p = new BoardGameSearchParams
        {
            Q = q,
            Jugadores = jugadoresFilter,
            Sort = sort,
            Page = page < 1 ? 1 : page,
            Limit = limit < 1 ? 10 : (limit > 50 ? 50 : limit)
        };

        var result = await _service.SearchAsync(p);
        return Ok(result);
    }

    /// <summary>
    /// Crea un juego de mesa. Devuelve 201 Created con el recurso creado y header Location.
    /// </summary>
    /// <response code="201">Juego creado.</response>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(BoardGameDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreateBoardGameCommand command,
        CancellationToken ct)
    {
        var boardGame = _createHandler.Handle(command.Titulo, command.Socio, command.JugadoresMin, command.JugadoresMax);
        await _repository.AddAsync(boardGame, ct);
        var created = await _repository.GetByIdAsync(boardGame.Id, ct);
        var dto = created is not null ? MapToDto(created) : MapToDto(boardGame);
        return Created($"/api/BoardGames/{dto.Id}", dto);
    }

    public record UpdateBoardGameRequest(
        string? Titulo,
        int? JugadoresMin,
        int? JugadoresMax
    );

    /// <summary>
    /// Actualiza los datos básicos de un juego de mesa existente.
    /// </summary>
    /// <response code="200">Juego actualizado.</response>
    /// <response code="404">No se encontró el juego.</response>
    [HttpPut("{slug}")]
    [Authorize]
    [ProducesResponseType(typeof(BoardGameDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BoardGameDto>> Update(
        string slug,
        [FromBody] UpdateBoardGameRequest request,
        CancellationToken ct)
    {
        var game = await _repository.GetBySlugAsync(slug, ct);
        if (game is null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Titulo))
        {
            game.SetTitulo(request.Titulo);
        }

        if (request.JugadoresMin.HasValue && request.JugadoresMax.HasValue)
        {
            game.SetJugadores(request.JugadoresMin.Value, request.JugadoresMax.Value);
        }

        await _repository.UpdateAsync(game, ct);

        var dto = MapToDto(game);
        return Ok(dto);
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
