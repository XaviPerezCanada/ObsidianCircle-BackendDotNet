using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.BoardGames.UseCases;

namespace MiProyecto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardGamesController : ControllerBase
{
    private readonly CreateBoardGameHandler _createHandler;

    public BoardGamesController(CreateBoardGameHandler createHandler)
    {
        _createHandler = createHandler;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateBoardGameCommand command,
        CancellationToken ct)
    {
        var result = _createHandler.Handle(command.Titulo, command.Socio, command.JugadoresMin, command.JugadoresMax);
        return Ok(result);
    }
}
