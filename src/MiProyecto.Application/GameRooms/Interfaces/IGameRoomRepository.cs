using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.GameRooms.Entities;

namespace MiProyecto.Application.GameRooms.Interfaces
{
    public interface IGameRoomRepository
    {
        Task AddAsync(GameRoom gameRoom);
        Task<GameRoom?> GetBySlugAsync(Slug slug);

        Task<IEnumerable<GameRoom>> GetAllAsync();

        Task<IEnumerable<GameRoom>> GetAvailableAsync();

        Task DeleteAsync(GameRoom gameRoom);

        Task UpdateAsync(GameRoom room);
        Task<GameRoom?> GetByNameAsync(string name);

        Task<GameRoom?> GetByIdAsync(Guid id);



    }
}
