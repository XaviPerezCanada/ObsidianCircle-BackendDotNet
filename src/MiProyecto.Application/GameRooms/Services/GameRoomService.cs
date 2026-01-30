using MiProyecto.Application.GameRooms.DTOs;
using MiProyecto.Domain.GameRooms.Entities;
using MiProyecto.Application.GameRooms.Interfaces;
using MiProyecto.Domain.Common.Exceptions;
using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.BoardGames.Exceptions;


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
        public async Task<IEnumerable<GameRoomDto>> GetAvailableRoomsAsync()
        {
            var rooms = await _repository.GetAvailableAsync();

            if (rooms == null)
                throw new NotFoundException("no hay salas activas");

            return rooms.Select(r =>
                new GameRoomDto(r.Id, r.Name, r.Slug, r.Capacity, r.Status.ToString(), r.Description)
            );
        }
       

        public async Task<string> CreateRoomAsync(CreateGameRoomDto dto)
        {
            // 1) Verificar que el nombre sea único
            var existingRoom = await _repository.GetByNameAsync(dto.Name);
            if (existingRoom != null)
                throw new DomainException($"Ya existe una sala con el nombre '{dto.Name}'. Por favor, elige otro nombre.");

            // 2) Generamos un slug base a partir del nombre
            var uniqueSlug = await EnsureUniqueSlugAsync(dto.Name);

            // 3) Creamos la sala con un slug garantizado como único
            var newRoom = new GameRoom(dto.Name, uniqueSlug.Value, dto.Capacity, dto.Description);
            await _repository.AddAsync(newRoom);

            // Devolvemos el slug público (string)
            return newRoom.Slug;
        }

        public async Task UpdateRoomBySlugAsync(Slug slug, UpdateGameRoomDto dto)
        {
            var room = await _repository.GetBySlugAsync(slug);
            if (room == null)
                throw new NotFoundException("GameRoom", slug.Value);
            
            // Verificar que el nuevo nombre sea único (si ha cambiado)
            if (room.Name.ToLower() != dto.Name.ToLower().Trim())
            {
                var existingRoom = await _repository.GetByNameAsync(dto.Name);
                if (existingRoom != null && existingRoom.Id != room.Id)
                    throw new DomainException($"Ya existe una sala con el nombre '{dto.Name}'. Por favor, elige otro nombre.");
            }
            
            room.Update(dto.Name, dto.Capacity, dto.Description);

            await _repository.UpdateAsync(room);
        }

        public async Task DeleteRoomBySlugAsync(Slug slug)
        {
            var room = await _repository.GetBySlugAsync(slug);
            if (room == null)
                throw new NotFoundException("GameRoom", slug.Value);

            await _repository.DeleteAsync(room);
        }

        public async Task ActivateRoomBySlugAsync(Slug slug)
        {
            var room = await _repository.GetBySlugAsync(slug);
            if (room == null)
                throw new NotFoundException("GameRoom", slug.Value);

            room.Activate();
            await _repository.UpdateAsync(room);
        }

        public async Task DeactivateRoomBySlugAsync(Slug slug)
        {
            var room = await _repository.GetBySlugAsync(slug);
            if (room == null)
                throw new NotFoundException("GameRoom", slug.Value);

            room.Deactivate();
            await _repository.UpdateAsync(room);
        }

        public async Task SetMaintenanceModeBySlugAsync(Slug slug)
        {
            var room = await _repository.GetBySlugAsync(slug);
            if (room == null)
                throw new NotFoundException("GameRoom", slug.Value);

            room.SetMaintenanceMode();
            await _repository.UpdateAsync(room);
        }

        /// <summary>
        /// Garantiza que el slug que se genere a partir del nombre sea único.
        /// Si ya existe uno igual, va probando con sufijos "-2", "-3", etc.
        /// </summary>
        private async Task<Slug> EnsureUniqueSlugAsync(string baseName)
        {
            // Slug base a partir del nombre original
            var baseSlug = Slug.From(baseName, _slugGenerator);
            var currentSlug = baseSlug;
            var counter = 2;

            // Mientras exista una sala con ese slug, generamos uno nuevo con sufijo
            while (await _repository.GetBySlugAsync(currentSlug) is not null)
            {
                var candidateName = $"{baseName}-{counter}";
                currentSlug = Slug.From(candidateName, _slugGenerator);
                counter++;
            }

            return currentSlug;
        }
    }
}
