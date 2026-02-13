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
           
            builder.Property(x => x.Status)
                .HasConversion(
                    status => status.Value,       
                    value => Status.From(value)   
                );

        
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).IsRequired().HasMaxLength(100);

            
            builder.Property(x => x.Slug)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.HasIndex(x => x.Slug)
                   .IsUnique();

         
            builder.HasIndex(x => x.Name)
                   .IsUnique();
        }
    }
}