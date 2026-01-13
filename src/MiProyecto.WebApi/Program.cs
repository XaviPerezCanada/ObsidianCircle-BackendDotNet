using Microsoft.EntityFrameworkCore;
using MiProyecto.Infrastructure.Persistence;
using MiProyecto.Application;

var builder = WebApplication.CreateBuilder(args);

// Controllers (IMPORTANTE)
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// OpenAPI / Swagger (forma estándar)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DBs
var sqlConn = builder.Configuration.GetConnectionString("DefaultConnection");
var pgConn = builder.Configuration.GetConnectionString("PostgresConnection");

builder.Services.AddDbContext<SqlServerDbContext>(options =>
    options.UseSqlServer(sqlConn));

builder.Services.AddDbContext<PostgresDbContext>(options =>
    options.UseNpgsql(pgConn));

// Application services
builder.Services.AddApplicationServices();

var app = builder.Build();

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthorization();
 
app.MapControllers();

app.Run();
