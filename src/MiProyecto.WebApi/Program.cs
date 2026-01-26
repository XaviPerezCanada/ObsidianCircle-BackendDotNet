using Microsoft.EntityFrameworkCore;
using MiProyecto.Application;
using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Application.Interfaces;
using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.GameRooms.Interfaces;
using MiProyecto.Infrastructure.BoardGames.Repositories;
using MiProyecto.Infrastructure.Common;
using MiProyecto.Infrastructure.GameRooms.Repositories;
using MiProyecto.Infrastructure.Persistence;
using MiProyecto.Infrastructure.Persistence.UnitOfWork;
using MiProyecto.WebApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
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
    options.UseNpgsql(pgConn, npgsqlOptions => 
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null)));
builder.Services.AddSingleton<ISlugGenerator, DefaultSlugGenerator>();

builder.Services.AddScoped<ISqlUnitOfWork, SqlUnitOfWork>();
builder.Services.AddScoped<IPgUnitOfWork, PgUnitOfWork>();

builder.Services.AddScoped<IBoardGameRepository, SqlBoardGameRepository>();
builder.Services.AddScoped<IGameRoomRepository, GameRoomRepository>();

builder.Services.AddApplicationServices();

var app = builder.Build();

// Crear la base de datos y las tablas si no existen (solo en desarrollo)
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var pgContext = scope.ServiceProvider.GetRequiredService<PostgresDbContext>();
        pgContext.Database.EnsureCreated();
    }
    
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

// Middleware de manejo de excepciones global (debe ir antes de UseAuthorization)
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthorization();
app.MapControllers();
app.Run();
