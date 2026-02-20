using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiProyecto.Domain.Users;

namespace MiProyecto.Infrastructure.Persistence;

public class RefreshSessionConfiguration : IEntityTypeConfiguration<RefreshSession>
{
    public void Configure(EntityTypeBuilder<RefreshSession> builder)
    {
        builder.ToTable("refresh_sessions");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.UserEmail)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(s => s.DeviceId)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(s => s.FamilyId)
            .IsRequired();

        builder.Property(s => s.CurrentTokenHash)
            .IsRequired()
            .HasMaxLength(512);

        builder.Property(s => s.Revoked)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.SessionVersion)
            .IsRequired();

        builder.HasIndex(s => s.UserEmail);
        builder.HasIndex(s => new { s.UserEmail, s.DeviceId });
        builder.HasIndex(s => s.FamilyId);
        builder.HasIndex(s => s.CurrentTokenHash)
            .IsUnique();
    }
}