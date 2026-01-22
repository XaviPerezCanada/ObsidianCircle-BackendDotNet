using MiProyecto.Domain.GameRooms.Entities;

namespace MiProyecto.Application.GameRooms.Interfaces
{
    internal interface IGameRoomRepository
    {
        Task AddAsync(GameRoom gameRoom);
        Task<GameRoom?> GetByIdAsync(Guid id);
    }
}
