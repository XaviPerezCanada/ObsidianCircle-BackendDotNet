using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.GameRooms.Entities;

namespace MiProyecto.Domain.GameRooms.Interfaces
{
    public interface IGameRoomRepository
    {
        Task<GameRoom?> GetBySlugAsync(Slug slug);
        Task<GameRoom?> GetByNameAsync(string name);
        Task<IEnumerable<GameRoom>> GetAllAsync(); 

        Task<IEnumerable<GameRoom>> GetAvailableAsync();
        Task AddAsync(GameRoom room);
        Task UpdateAsync(GameRoom room);
        Task DeleteAsync(GameRoom room);

    }
}