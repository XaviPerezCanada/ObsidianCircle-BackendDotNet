using Microsoft.Extensions.DependencyInjection;
using MiProyecto.Application.BoardGames.UseCases;
using MiProyecto.Application.GameRooms.Services;
using MiProyecto.Application.Reservations.Services.CancelReservation;
using MiProyecto.Application.Reservations.Services.UpdateReservation;
using MiProyecto.Application.Reservations.UseCases.CreateReservation;

namespace MiProyecto.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // BoardGames
        services.AddScoped<CreateBoardGameHandler>();
        
        // GameRooms
        services.AddScoped<GameRoomService>();

        services.AddScoped<CreateReservationHandler>();
        

        services.AddScoped<CancelReservationHandler>();

        services.AddScoped<UpdateReservationHandler>();
        return services;
    }
}
