using Microsoft.Extensions.DependencyInjection;
using MiProyecto.Application.BoardGames.UseCases;

namespace MiProyecto.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<CreateBoardGameHandler>();
        return services;
    }
}
