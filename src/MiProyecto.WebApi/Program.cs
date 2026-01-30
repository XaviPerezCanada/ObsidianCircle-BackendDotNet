using Microsoft.EntityFrameworkCore;
using MiProyecto.Application;
using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Application.Interfaces;
using MiProyecto.Application.Users;
using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Application.GameRooms.Interfaces;
using MiProyecto.Infrastructure.BoardGames.Repositories;
using MiProyecto.Infrastructure.Common;
using MiProyecto.Infrastructure.GameRooms.Repositories;
using MiProyecto.Infrastructure.Persistence.UnitOfWork;
using MiProyecto.Infrastructure.Users;
using MiProyecto.WebApi.Middleware;
using MiProyecto.Application.Reservations.Interfaces;
using MiProyecto.Infrastructure.Reservations.Repositories;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configurar serialización JSON para usar camelCase (compatible con JavaScript/TypeScript)
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true; // Opcional: para desarrollo
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // En desarrollo, permitir cualquier origen localhost
            policy.WithOrigins(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "http://127.0.0.1:5173",
                    "http://127.0.0.1:3000"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
        else
        {
            // En producción, solo permitir orígenes específicos
            policy.WithOrigins("https://tu-dominio.com")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var sqlConn = builder.Configuration.GetConnectionString("DefaultConnection");
var pgConn = builder.Configuration.GetConnectionString("PostgresConnection");

if (string.IsNullOrWhiteSpace(sqlConn))
    throw new Exception("Connection string 'DefaultConnection' no encontrada.");
if (string.IsNullOrWhiteSpace(pgConn))
    throw new Exception("Connection string 'PostgresConnection' no encontrada.");

builder.Services.AddDbContext<SqlServerDbContext>(options => 
    options.UseSqlServer(sqlConn, sqlOptions => 
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null)));
builder.Services.AddDbContext<PostgresDbContext>(options =>
    options.UseNpgsql(pgConn, npgsqlOptions => {
        // Habilitar reintentos
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);

        // AQU? EST? LA MAGIA: Definimos d?nde viven las migraciones
        npgsqlOptions.MigrationsAssembly("MiProyecto.Infrastructure");
    }));
builder.Services.AddSingleton<ISlugGenerator, DefaultSlugGenerator>();

builder.Services.AddScoped<ISqlUnitOfWork, SqlUnitOfWork>();
builder.Services.AddScoped<IPgUnitOfWork, PgUnitOfWork>();

builder.Services.AddScoped<IBoardGameRepository, BoardGameRepository>();
builder.Services.AddScoped<IGameRoomRepository, GameRoomRepository>();
builder.Services.AddScoped<IUserHandler, UserHandler>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();


builder.Services.AddApplicationServices();

var app = builder.Build();

// Crear la base de datos y las tablas si no existen (solo en desarrollo)
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var pgContext = scope.ServiceProvider.GetRequiredService<PostgresDbContext>();
        pgContext.Database.Migrate();

    }

    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS debe estar ANTES de UseHttpsRedirection y otros middlewares
app.UseCors("AllowReactApp");

app.UseHttpsRedirection();

// Middleware de manejo de excepciones global (debe ir antes de UseAuthorization)
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthorization();
app.MapControllers();
app.Run();
