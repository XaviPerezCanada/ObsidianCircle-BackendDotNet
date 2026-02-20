using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiProyecto.Domain.Users;
using MiProyecto.Domain.Common.ValueObjects;

namespace MiProyecto.Infrastructure.Persistence;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(u => u.Email);

        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasIndex(u => u.Username).IsUnique();

        
        builder.Property(u => u.Status)
            .HasConversion(
                status => status.Value,        
                value => Status.From(value)  
            )
            .HasColumnName("status")
            .IsRequired();

  
        builder.Property(u => u.Type)
            .HasConversion(
                type => type.Value,            
                value => UserType.From(value) 
            )
            .HasColumnName("type")
            .IsRequired();

    
        builder.OwnsOne(u => u.Slug, slug =>
        {
            slug.Property(s => s.Value)
                .HasColumnName("slug")
                .IsRequired();
        });
        builder.Property(u => u.SessionVersion)
        .HasColumnName("session_version")
        .IsRequired()
        .HasDefaultValue(0);

        
        builder.Property(u => u.PasswordHash).IsRequired();
        builder.Property(u => u.Salt).IsRequired();
        builder.Property(u => u.Username).IsRequired();
        builder.Property(u => u.Email).IsRequired();
        builder.Property(u => u.Bio).HasDefaultValue(string.Empty);
        builder.Property(u => u.Image).HasDefaultValue(string.Empty);
        builder.Property(u => u.CreatedAt).IsRequired();
        builder.Property(u => u.ModifiedAt).IsRequired(false);
    }
}
