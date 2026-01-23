using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.GameRooms.Entities;

namespace MiProyecto.Domain.GameRooms.Interfaces
{
    public interface IGameRoomRepository
    {
        Task<GameRoom?> GetBySlugAsync(Slug slug);
        Task<IEnumerable<GameRoom>> GetAllAsync(); 
        Task AddAsync(GameRoom room);
        Task UpdateAsync(GameRoom room);
        Task DeleteAsync(GameRoom room);

    }
}