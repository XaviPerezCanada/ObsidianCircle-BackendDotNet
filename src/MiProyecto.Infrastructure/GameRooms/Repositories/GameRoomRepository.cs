using MiProyecto.Domain.GameRooms.Entities;
using MiProyecto.Domain.GameRooms.Interfaces;
using Microsoft.EntityFrameworkCore;
using MiProyecto.Domain.Common.ValueObjects;

namespace MiProyecto.Infrastructure.GameRooms.Repositories

{
    public class GameRoomRepository : IGameRoomRepository
    {
        private readonly PostgresDbContext _db;
        public GameRoomRepository(PostgresDbContext db) => _db = db;



        public async Task<GameRoom?> GetBySlugAsync(Slug slug)
        {
            return await _db.Set<GameRoom>()
                .FirstOrDefaultAsync(r => r.Slug == slug.Value);
        }

        public async Task<GameRoom?> GetByNameAsync(string name)
        {
            return await _db.Set<GameRoom>()
                .FirstOrDefaultAsync(r => r.Name.ToLower() == name.ToLower().Trim());
        }

        public async Task<IEnumerable<GameRoom>> GetAllAsync()
        {
            return await _db.Set<GameRoom>().ToListAsync();
        }
        public async Task<IEnumerable<GameRoom>> GetAvailableAsync()
        {
            return await _db.Set<GameRoom>()
                .Where(r => r.Status != Status.Inactive)
                .ToListAsync();
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
        public async Task DeleteAsync(GameRoom room)
        {
            // Eliminación física de la base de datos
            _db.Set<GameRoom>().Remove(room);
            await _db.SaveChangesAsync();
        }


       
    }
}