using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiProyecto.Domain.Subscriptions;

namespace MiProyecto.Infrastructure.Persistence;

public class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("plans");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Nombre)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Slug)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(p => p.Slug).IsUnique();

        builder.Property(p => p.PrecioCent)
            .IsRequired();

        builder.Property(p => p.Activo)
            .IsRequired();

        builder.Property(p => p.Periodo)
            .HasConversion(
                p => p.ToString(),
                value => Enum.Parse<PlanPeriodo>(value))
            .IsRequired();

        builder.Property(p => p.StripePriceId)
            .HasMaxLength(200);
    }
}

