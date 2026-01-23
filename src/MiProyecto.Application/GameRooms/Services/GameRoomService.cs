using MiProyecto.Application.GameRooms.DTOs;
using MiProyecto.Domain.GameRooms.Entities;
using MiProyecto.Domain.GameRooms.Interfaces;
using MiProyecto.Domain.Common.Exceptions;
using MiProyecto.Domain.Common.ValueObjects;


namespace MiProyecto.Application.GameRooms.Services
{
    public class GameRoomService
    {
        private readonly IGameRoomRepository _repository;
        private readonly ISlugGenerator _slugGenerator;

        public GameRoomService(IGameRoomRepository repository, ISlugGenerator slugGenerator)
        {
            _repository = repository;
            _slugGenerator = slugGenerator;
        }

        public async Task<IEnumerable<GameRoomDto>> GetAllRoomsAsync()
        {
            var rooms = await _repository.GetAllAsync();

            return rooms.Select(r =>
                new GameRoomDto(r.Id, r.Name, r.Slug, r.Capacity, r.Status.ToString(), r.Description)
            );
        }

        public async Task<GameRoomDto> GetRoomBySlugAsync(Slug slug)
        {
            var room = await _repository.GetBySlugAsync(slug);
            if (room == null)
                throw new NotFoundException("GameRoom", slug.Value);

            return new GameRoomDto(room.Id, room.Name,room.Slug, room.Capacity, room.Status.ToString(), room.Description);
        }

        public async Task<string> CreateRoomAsync(CreateGameRoomDto dto)
        {
            var slug = Slug.From(dto.Name, _slugGenerator);

            // (Opcional recomendado) asegurar unicidad
            // slug = await EnsureUniqueSlugAsync(slug);

            var newRoom = new GameRoom(dto.Name, slug.Value, dto.Capacity, dto.Description);
            await _repository.AddAsync(newRoom);

            return newRoom.Slug; // devolver el slug público
        }

        public async Task UpdateRoomBySlugAsync(Slug slug, UpdateGameRoomDto dto)
        {
            var room = await _repository.GetBySlugAsync(slug);
            if (room == null)
                throw new NotFoundException("GameRoom", slug.Value);

            // NO cambies slug (fijo)
            room.Update(dto.Name, dto.Capacity);

            await _repository.UpdateAsync(room);
        }

        public async Task DeleteRoomBySlugAsync(Slug slug)
        {
            var room = await _repository.GetBySlugAsync(slug);
            if (room == null)
                throw new NotFoundException("GameRoom", slug.Value);

            await _repository.DeleteAsync(room);
        }

        // Si quieres unicidad, te lo dejo preparado:
        // private async Task<Slug> EnsureUniqueSlugAsync(Slug baseSlug) { ... }
    }
}
