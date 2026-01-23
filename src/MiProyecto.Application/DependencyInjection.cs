using Microsoft.Extensions.DependencyInjection;
using MiProyecto.Application.BoardGames.UseCases;
using MiProyecto.Application.GameRooms.Services;

namespace MiProyecto.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // BoardGames
        services.AddScoped<CreateBoardGameHandler>();
        
        // GameRooms
        services.AddScoped<GameRoomService>();
        
        return services;
    }
}
