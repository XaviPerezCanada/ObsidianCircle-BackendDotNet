using Microsoft.EntityFrameworkCore;
using MiProyecto.Application;
using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Application.Interfaces;
using MiProyecto.Domain.Common;
using MiProyecto.Infrastructure.BoardGames.Repositories;
using MiProyecto.Infrastructure.Common;
using MiProyecto.Infrastructure.Persistence;
using MiProyecto.Infrastructure.Persistence.UnitOfWork;
using MiProyecto.WebApi.Middleware;
using MiProyecto.Infrastructure;

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

builder.Services.AddDbContext<SqlServerDbContext>(options => options.UseSqlServer(sqlConn));
builder.Services.AddDbContext<PostgresDbContext>(options => options.UseNpgsql(pgConn));
builder.Services.AddSingleton<ISlugGenerator, DefaultSlugGenerator>();

builder.Services.AddScoped<ISqlUnitOfWork, SqlUnitOfWork>();
builder.Services.AddScoped<IPgUnitOfWork, PgUnitOfWork>();

// Registrar servicios de aplicación
builder.Services.AddApplicationServices();

// Registrar implementaciones de infraestructura (mueve aquí los repositorios concretos)
builder.Services.AddInfrastructureServices(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
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