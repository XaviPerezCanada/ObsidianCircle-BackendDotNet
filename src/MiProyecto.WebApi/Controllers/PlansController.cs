using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.Subscriptions.Interfaces;

namespace MiProyecto.WebApi.Controllers;

[ApiController]
[Route("api/planes")]
public class PlansController : ControllerBase
{
    private readonly IPlanRepository _plans;

    public PlansController(IPlanRepository plans)
    {
        _plans = plans;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetActive(CancellationToken ct)
    {
        var plans = await _plans.GetActiveAsync(ct);

        var result = plans.Select(p => new
        {
            id = p.Id,
            slug = p.Slug,
            nombre = p.Nombre,
            precio_cent = p.PrecioCent,
            periodo = p.Periodo.ToString().ToUpperInvariant(),
            activo = p.Activo ? 1 : 0
        });

        return Ok(result);
    }
}

