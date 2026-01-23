using Microsoft.AspNetCore.Mvc;
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GameRoomDto>>> GetAll()
        {
            var rooms = await _service.GetAllRoomsAsync();
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
    }
}
