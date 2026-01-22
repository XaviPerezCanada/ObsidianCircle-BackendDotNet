using MiProyecto.Domain.GameRooms.Entities;

namespace MiProyecto.Domain.Interfaces
{
    public interface IGameRoomRepository
    {
        Task<GameRoom?> GetByIdAsync(Guid id);
        Task<IEnumerable<GameRoom>> GetAllAsync(); // Para el listado del dashboard
        Task AddAsync(GameRoom room);
        Task UpdateAsync(GameRoom room);
        Task DeleteAsync(GameRoom room);

    }
}