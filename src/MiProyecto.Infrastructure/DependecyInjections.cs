using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

using MiProyecto.Application.GameRooms.Interfaces;
using MiProyecto.Application.Reservations.Interfaces;
using MiProyecto.Application.BoardGames.Interfaces;

using MiProyecto.Infrastructure.GameRooms.Repositories;
using MiProyecto.Infrastructure.Reservations.Repositories;
using MiProyecto.Infrastructure.BoardGames.Repositories;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<PostgresDbContext>(options =>
            options.UseNpgsql(config.GetConnectionString("Default")));

        services.AddScoped<IGameRoomRepository, GameRoomRepository>();
        services.AddScoped<IReservationRepository, ReservationRepository>();
        services.AddScoped<IBoardGameRepository, BoardGameRepository>();

        return services;
    }
}
