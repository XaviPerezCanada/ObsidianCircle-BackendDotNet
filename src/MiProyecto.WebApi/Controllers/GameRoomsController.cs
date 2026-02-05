using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.Common;
using MiProyecto.Application.GameRooms.DTOs;
using MiProyecto.Application.GameRooms.Services;
using MiProyecto.Domain.Common.ValueObjects;

namespace MiProyecto.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameRoomsController : ControllerBase
    {
        private readonly GameRoomService _service;
        private readonly ISlugGenerator _slugGenerator;

        public GameRoomsController(GameRoomService service, ISlugGenerator slugGenerator)
        {
            _service = service;
            _slugGenerator = slugGenerator;
        }

        /// <summary>
        /// Lista todas las salas (visible en Swagger).
        /// </summary>
        /// <response code="200">Lista de salas.</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<GameRoomDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<GameRoomDto>>> GetAll()
        {
            var rooms = await _service.GetAllRoomsAsync();
            return Ok(rooms);
        }

        /// <summary>
        /// Búsqueda paginada: ?q=texto&amp;capacity=20 (o capacity=4,6,8)&amp;sort=nombre_asc|nombre_desc&amp;page=1&amp;limit=10
        /// capacity en la URL siempre llega como string (ej. "20" o "4,6,8").
        /// </summary>
        /// <response code="200">Resultado paginado con items, page, pageSize, totalCount.</response>
        [HttpGet("search")]
        [ProducesResponseType(typeof(PagedResult<GameRoomDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PagedResult<GameRoomDto>>> Search(
            [FromQuery] string? q,
            [FromQuery] string? capacity,
            [FromQuery] string? sort,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            // Parsear capacity desde string: "20" -> [20], "4,6,8" -> [4,6,8]
            List<int>? capacityList = null;
            if (!string.IsNullOrWhiteSpace(capacity))
            {
                capacityList = capacity!
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Select(s => int.TryParse(s.Trim(), out var n) ? n : (int?)null)
                    .Where(n => n.HasValue)
                    .Select(n => n!.Value)
                    .ToList();
                if (capacityList.Count == 0)
                    capacityList = null;
            }

            var p = new GameRoomSearchParams
            {
                Q = q,
                Capacity = capacityList,
                Sort = sort,
                Page = page < 1 ? 1 : page,
                Limit = limit < 1 ? 10 : (limit > 50 ? 50 : limit)
            };

            var result = await _service.SearchAsync(p);
            return Ok(result);
        }

        [HttpGet("available")]

        public async Task<ActionResult<IEnumerable<GameRoomDto>>> GetAllAvailableResultAsync() {

            var rooms = await _service.GetAvailableRoomsAsync(); 
            return Ok(rooms);
        }

        [HttpGet("{slug}")]
        public async Task<ActionResult<GameRoomDto>> GetBySlug([FromRoute] string slug)
        {
            var room = await _service.GetRoomBySlugAsync(Slug.From(slug, _slugGenerator));
            return Ok(room);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateGameRoomDto request)
        {
            var slug = await _service.CreateRoomAsync(request);

            // 201 + Location header (REST)
            return CreatedAtAction(nameof(GetBySlug), new { slug }, new { slug });
        }

        [HttpPut("{slug}")]
        public async Task<IActionResult> Update([FromRoute] string slug, [FromBody] UpdateGameRoomDto dto)
        {
            await _service.UpdateRoomBySlugAsync(Slug.From(slug, _slugGenerator), dto);
            return NoContent();
        }

        [HttpDelete("{slug}")]
        public async Task<IActionResult> Delete([FromRoute] string slug)
        {
            await _service.DeleteRoomBySlugAsync(Slug.From(slug, _slugGenerator));
            return NoContent();
        }

        [HttpPatch("{slug}/activate")]
        public async Task<IActionResult> Activate([FromRoute] string slug)
        {
            await _service.ActivateRoomBySlugAsync(Slug.From(slug, _slugGenerator));
            return NoContent();
        }

        [HttpPatch("{slug}/deactivate")]
        public async Task<IActionResult> Deactivate([FromRoute] string slug)
        {
            await _service.DeactivateRoomBySlugAsync(Slug.From(slug, _slugGenerator));
            return NoContent();
        }

        [HttpPatch("{slug}/maintenance")]
        public async Task<IActionResult> SetMaintenanceMode([FromRoute] string slug)
        {
            await _service.SetMaintenanceModeBySlugAsync(Slug.From(slug, _slugGenerator));
            return NoContent();
        }
    }
}
