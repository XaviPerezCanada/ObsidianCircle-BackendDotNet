using MiProyecto.Domain.GameRooms.Entities;
using MiProyecto.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MiProyecto.Infrastructure.Persistence
{
    public class GameRoomRepository : IGameRoomRepository
    {
        private readonly SqlServerDbContext _db;
        public GameRoomRepository(SqlServerDbContext db) => _db = db;



        public async Task<GameRoom?> GetByIdAsync(Guid id)
        {
            return await _db.Set<GameRoom>().FindAsync(id);
        }

        public async Task<IEnumerable<GameRoom>> GetAllAsync()
        {
            return await _db.Set<GameRoom>().ToListAsync();
        }


        public async Task AddAsync(GameRoom gameRoom)
        {
            await _db.Set<GameRoom>().AddAsync(gameRoom);
            await _db.SaveChangesAsync();
        }

        public async Task UpdateAsync(GameRoom room)
        {
            _db.Set<GameRoom>().Update(room);
            await _db.SaveChangesAsync();
        }
        public async Task DeleteAsync(GameRoom gameRoom)
        {
            _db.Set<GameRoom>().Remove(gameRoom);
            await _db.SaveChangesAsync();
        }


       
    }
}