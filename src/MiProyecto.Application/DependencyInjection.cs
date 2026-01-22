using Microsoft.Extensions.DependencyInjection;
using MiProyecto.Application.BoardGames.UseCases;
using MiProyecto.Application.Services;
using MiProyecto.Domain.Interfaces;
using MiProyecto.Infrastructure.Persistence;

namespace MiProyecto.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // BoardGames
        services.AddScoped<CreateBoardGameHandler>();
        
        // GameRooms
        services.AddScoped<IGameRoomRepository, GameRoomRepository>();
        services.AddScoped<GameRoomService>();
        
        return services;
    }
}
