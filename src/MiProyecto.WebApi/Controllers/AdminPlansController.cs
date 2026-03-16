using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.Subscriptions.Interfaces;
using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.Subscriptions;

namespace MiProyecto.WebApi.Controllers;

[ApiController]
[Route("api/admin/plans")]
[Authorize] // El filtro de rol lo haces con tu UserType en middleware/policies
public class AdminPlansController : ControllerBase
{
    private readonly IPlanRepository _plans;
    private readonly ISlugGenerator _slugGenerator;

    public AdminPlansController(IPlanRepository plans, ISlugGenerator slugGenerator)
    {
        _plans = plans;
        _slugGenerator = slugGenerator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll(CancellationToken ct)
    {
        var plans = await _plans.GetAllAsync(ct);
        var result = plans.Select(p => new
        {
            id = p.Id,
            slug = p.Slug,
            nombre = p.Nombre,
            precio_cent = p.PrecioCent,
            periodo = p.Periodo.ToString().ToUpperInvariant(),
            activo = p.Activo
        });
        return Ok(result);
    }

    public record PlanInput(string Nombre, string Slug, int PrecioCent, string Periodo, bool Activo);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PlanInput input, CancellationToken ct)
    {
        if (!Enum.TryParse<PlanPeriodo>(input.Periodo, true, out var periodo))
            return BadRequest(new { message = "Periodo inválido" });

        var slug = Slug.From(string.IsNullOrWhiteSpace(input.Slug) ? input.Nombre : input.Slug, _slugGenerator);
        var plan = new Plan(input.Nombre, slug, input.PrecioCent, periodo, input.Activo);
        await _plans.AddAsync(plan, ct);
        return CreatedAtAction(nameof(GetAll), new { id = plan.Id }, null);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PlanInput input, CancellationToken ct)
    {
        var plan = await _plans.GetByIdAsync(id, ct);
        if (plan is null) return NotFound();

        if (!Enum.TryParse<PlanPeriodo>(input.Periodo, true, out var periodo))
            return BadRequest(new { message = "Periodo inválido" });

        var slug = Slug.From(string.IsNullOrWhiteSpace(input.Slug) ? input.Nombre : input.Slug, _slugGenerator);
        plan.Update(input.Nombre, slug, input.PrecioCent, periodo, input.Activo);
        await _plans.UpdateAsync(plan, ct);
        return NoContent();
    }
}

