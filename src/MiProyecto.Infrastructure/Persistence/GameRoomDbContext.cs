using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiProyecto.Domain.GameRooms.Entities;
using MiProyecto.Domain.Common.ValueObjects;

namespace MiProyecto.Infrastructure.Persistence
{ 
    public class GameRoomConfiguration : IEntityTypeConfiguration<GameRoom> 
    {
        public void Configure(EntityTypeBuilder<GameRoom> builder)
        {
            // AQUÍ es donde solucionas el error del Value Object
            builder.Property(x => x.Status)
                .HasConversion(
                    status => status.Value,       // Al guardar: extrae el string
                    value => Status.From(value)   // Al leer: crea el objeto Status
                );

            // Opcional: Configuraciones extra
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).IsRequired().HasMaxLength(100);

            // IMPORTANTE: el slug debe ser único porque lo usamos en los endpoints
            builder.Property(x => x.Slug)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.HasIndex(x => x.Slug)
                   .IsUnique();

            // IMPORTANTE: el nombre debe ser único para evitar confusiones
            builder.HasIndex(x => x.Name)
                   .IsUnique();
        }
    }
}