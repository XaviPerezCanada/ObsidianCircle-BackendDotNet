using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MiProyecto.Application;
using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Application.GameRooms.Interfaces;
using MiProyecto.Application.Interfaces;
using MiProyecto.Application.Reservations.Interfaces;
using MiProyecto.Application.Users.Mapping;
using MiProyecto.Application.Users.Services;
using MiProyecto.Application.Users.Validation;
using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.Security;
using MiProyecto.Domain.Users.Interfaces;
using MiProyecto.Infrastructure.Users.Repositories;
using MiProyecto.Infrastructure.BoardGames.Repositories;
using MiProyecto.Infrastructure.Common;
using MiProyecto.Infrastructure.GameRooms.Repositories;
using MiProyecto.Infrastructure.Persistence.UnitOfWork;
using MiProyecto.Infrastructure.Reservations.Repositories;
using MiProyecto.Infrastructure.Security;
using MiProyecto.WebApi.Middleware;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// --- CONFIGURACIÓN DE CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.WithOrigins(
                      "http://localhost:5173",
                      "https://localhost:5173",
                      "http://localhost:3000",
                      "http://127.0.0.1:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            policy.WithOrigins("https://tu-dominio.com")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- FLUENTVALIDATION ---
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<NewUserDtoValidator>();

// --- AUTOMAPPER ---
builder.Services.AddAutoMapper(typeof(UserMappingProfile).Assembly); 


builder.Services.Configure<JwtIssuerOptions>(
    builder.Configuration.GetSection("JwtIssuerOptions")
);

var jwtSettings = builder.Configuration.GetSection("JwtIssuerOptions").Get<JwtIssuerOptions>();

var secretKey = jwtSettings?.SecretKey ?? "Clave_De_Seguridad_Temporal_De_32_Caracteres_Minimo";
var keyBytes = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings?.Issuer ?? "TuProyectoAPI",
            ValidAudience = jwtSettings?.Audience ?? "TuProyectoClient",
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
        };
    });

// --- CONFIGURACIÓN DE BASES DE DATOS ---
var sqlConn = builder.Configuration.GetConnectionString("DefaultConnection");
var pgConn = builder.Configuration.GetConnectionString("PostgresConnection");

if (string.IsNullOrWhiteSpace(sqlConn) || string.IsNullOrWhiteSpace(pgConn))
    throw new Exception("Faltan cadenas de conexión en appsettings.json.");

builder.Services.AddDbContext<SqlServerDbContext>(options =>
    options.UseSqlServer(sqlConn));

builder.Services.AddDbContext<PostgresDbContext>(options =>
    options.UseNpgsql(pgConn, npgsqlOptions =>
        npgsqlOptions.MigrationsAssembly("MiProyecto.Infrastructure")));


builder.Services.AddSingleton<ISlugGenerator, DefaultSlugGenerator>();
builder.Services.AddScoped<ISqlUnitOfWork, SqlUnitOfWork>();
builder.Services.AddScoped<IPgUnitOfWork, PgUnitOfWork>();
builder.Services.AddScoped<IBoardGameRepository, BoardGameRepository>();
builder.Services.AddScoped<MiProyecto.Application.BoardGames.Services.BoardGameService>();
builder.Services.AddScoped<IGameRoomRepository, GameRoomRepository>();
builder.Services.AddScoped<MiProyecto.Domain.Users.Interfaces.IUserRepository, MiProyecto.Infrastructure.Users.Repositories.UserRepository>();
builder.Services.AddScoped<IAuthHandler, UserHandler>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IRefreshSessionRepository, RefreshSessionRepository>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddHttpContextAccessor();

builder.Services.AddApplicationServices();

var app = builder.Build();


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

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthentication(); // Primero identifica al usuario
app.UseAuthorization();  // Luego comprueba sus permisos

app.MapControllers();

app.Run();