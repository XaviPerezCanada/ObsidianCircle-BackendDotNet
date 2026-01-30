using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.Reservations.Dtos;
using MiProyecto.Application.Reservations.Services.CancelReservation;
using MiProyecto.Application.Reservations.UseCases.CreateReservation;

namespace MiProyecto.WebApi.Controllers;

[ApiController]
[Route("api/reservations")]
public class ReservationsController : ControllerBase
{
    private readonly CreateReservationHandler _createHandler;
    private readonly CancelReservationHandler _cancelHandler;

    public ReservationsController(
        CreateReservationHandler createHandler,
        CancelReservationHandler cancelHandler)
    {
        _createHandler = createHandler;
        _cancelHandler = cancelHandler;
    }

    // POST api/reservations
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReservationRequest request)
    {
        var result = await _createHandler.HandleAsync(request);

        if (!result.IsSuccess)
        {
            if (result.Error!.Contains("reservada"))
                return Conflict(new { error = result.Error });

            return BadRequest(new { error = result.Error });
        }
        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Value!.Id },
            result.Value
        );
    }

    // GET api/reservations/{id}
    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id)
    {
        // De momento no lo implementamos
        return Ok(new { id });
    }

    // DELETE api/reservations/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var result = await _cancelHandler.HandleAsync(id);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return NoContent();
    }
}
