using MiProyecto.Application.GameRooms.DTOs;
using MiProyecto.Domain.GameRooms.Entities;
using MiProyecto.Domain.Interfaces;
using MiProyecto.Domain.Common.Exceptions;

namespace MiProyecto.Application.Services
{
    public class GameRoomService
    {
        private readonly IGameRoomRepository _repository;

        public GameRoomService(IGameRoomRepository repository)
        {
            _repository = repository;
        }

        // GET: Listado completo
        public async Task<IEnumerable<GameRoomDto>> GetAllRoomsAsync()
        {
            var rooms = await _repository.GetAllAsync();
            // Mapeo manual de Entidad a DTO (podrías usar AutoMapper aquí)
            return rooms.Select(r => new GameRoomDto(r.Id, r.Name, r.Capacity, r.Status.ToString()));
        }

        // GET: Uno solo
        public async Task<GameRoomDto> GetRoomByIdAsync(Guid id)
        {
            var room = await _repository.GetByIdAsync(id);
            if (room == null) 
                throw new NotFoundException("GameRoom", id);
            
            return new GameRoomDto(room.Id, room.Name, room.Capacity, room.Status.ToString());
        }

        public async Task<Guid> CreateRoomAsync(CreateGameRoomDto dto)
        {
            
            var newRoom = new GameRoom(dto.Name, dto.Capacity);

            await _repository.AddAsync(newRoom);

            return newRoom.Id;
        }

        // PUT: Actualizar
        public async Task UpdateRoomAsync(Guid id, UpdateGameRoomDto dto)
        {
            var room = await _repository.GetByIdAsync(id);
            if (room == null) 
                throw new NotFoundException("GameRoom", id);

            // Usamos el método de dominio para validar y actualizar
            room.Update(dto.Name, dto.Capacity);

            await _repository.UpdateAsync(room);
        }

        // DELETE: Eliminar
        public async Task DeleteRoomAsync(Guid id)
        {
            var room = await _repository.GetByIdAsync(id);
            if (room == null) 
                throw new NotFoundException("GameRoom", id);

            await _repository.DeleteAsync(room);
        }
    }
}