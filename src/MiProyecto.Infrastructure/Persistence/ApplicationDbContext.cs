using Microsoft.EntityFrameworkCore;
using MiProyecto.Domain.Entities;


namespace MiProyecto.Infrastructure.Persistence;

public class SqlServerDbContext : DbContext
{
    public SqlServerDbContext(DbContextOptions<SqlServerDbContext> options) : base(options) { }

   
}

public class PostgresDbContext : DbContext
{
    public PostgresDbContext(DbContextOptions<PostgresDbContext> options) : base(options) { }

   
}
