using MiProyecto.Domain.GameRooms.Entities;
using MiProyecto.Domain.GameRooms.Interfaces;
using Microsoft.EntityFrameworkCore;
using MiProyecto.Domain.Common.ValueObjects;

namespace MiProyecto.Infrastructure.GameRooms.Repositories

{
    public class GameRoomRepository : IGameRoomRepository
    {
        private readonly SqlServerDbContext _db;
        public GameRoomRepository(SqlServerDbContext db) => _db = db;



        public async Task<GameRoom?> GetBySlugAsync(Slug slug)
        {
            return await _db.Set<GameRoom>()
                .FirstOrDefaultAsync(r => r.Slug == slug.Value);
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