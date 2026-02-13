using Microsoft.EntityFrameworkCore;
using MiProyecto.Application.Common;
using MiProyecto.Application.GameRooms.DTOs;
using MiProyecto.Application.GameRooms.Interfaces;
using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.GameRooms.Entities;

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
            _db.Set<GameRoom>().Remove(room);
            await _db.SaveChangesAsync();
        }

        public async Task<GameRoom?> GetByIdAsync(Guid id)
        {
            return await _db.Set<GameRoom>().FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<PagedResult<GameRoom>> SearchAsync(GameRoomSearchParams p)
        {
            IQueryable<GameRoom> q = _db.Set<GameRoom>().AsQueryable();

            // Búsqueda por texto (nombre, slug o descripción)
            if (!string.IsNullOrWhiteSpace(p.Q))
            {
                var like = p.Q.ToLower().Trim();
                q = q.Where(x =>
                    x.Name.ToLower().Contains(like) ||
                    x.Slug.ToLower().Contains(like) ||
                    (x.Description != null && x.Description.ToLower().Contains(like)));
            }

            // Filtro por capacidad: un solo valor = salas con esa capacidad o más (>=)
            if (p.Capacity?.Any() == true)
            {
                var capacityValues = p.Capacity.ToArray();
                if (capacityValues.Length == 1)
                    q = q.Where(x => x.Capacity >= capacityValues[0]);
                else
                    q = q.Where(x => capacityValues.Contains(x.Capacity));
            }

            // Ordenación
            q = (p.Sort ?? "") switch
            {
                "nombre_asc" => q.OrderBy(x => x.Name).ThenBy(x => x.Id),
                "nombre_desc" => q.OrderByDescending(x => x.Name).ThenBy(x => x.Id),
                _ => q.OrderBy(x => x.Id)
            };

            var total = await q.CountAsync();
            var items = await q
                .Skip((p.Page - 1) * p.Limit)
                .Take(p.Limit)
                .ToListAsync();

            return new PagedResult<GameRoom>(items, p.Page, p.Limit, total);
        }
    }
}