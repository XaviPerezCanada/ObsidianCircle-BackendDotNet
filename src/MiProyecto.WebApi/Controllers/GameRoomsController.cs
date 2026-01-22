using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.GameRooms.DTOs;
using MiProyecto.Application.Services;

namespace MiProyecto.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameRoomsController(GameRoomService service) : ControllerBase
    {
        private readonly GameRoomService _service = service;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GameRoomDto>>> GetAll()
        {
            var rooms = await _service.GetAllRoomsAsync();
            return Ok(rooms);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<GameRoomDto>> GetById(Guid id)
        {
            // El middleware manejará automáticamente NotFoundException
            var room = await _service.GetRoomByIdAsync(id);
            return Ok(room);
        }
        

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateGameRoomDto request)
        {
            // El middleware manejará automáticamente ArgumentException y otras excepciones
            var id = await _service.CreateRoomAsync(request);
            return Ok(new { RoomId = id });
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateGameRoomDto dto)
        {
            // El middleware manejará automáticamente NotFoundException y ArgumentException
            await _service.UpdateRoomAsync(id, dto);
            return NoContent(); // 204 No Content es estándar para updates exitosos
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            // El middleware manejará automáticamente NotFoundException
            await _service.DeleteRoomAsync(id);
            return NoContent();
        }
    }
}