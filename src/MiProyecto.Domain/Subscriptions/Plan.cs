using MiProyecto.Domain.Common.ValueObjects;

namespace MiProyecto.Domain.Subscriptions;

public enum PlanPeriodo
{
    Mensual,
    Trimestral,
    Anual
}

public class Plan
{
    public int Id { get; private set; }
    public string Slug { get; private set; } = default!;
    public string Nombre { get; private set; } = default!;
    public int PrecioCent { get; private set; }
    public PlanPeriodo Periodo { get; private set; }
    public bool Activo { get; private set; }
    public string? StripePriceId { get; private set; }

    protected Plan() { }

    public Plan(string nombre, Slug slug, int precioCent, PlanPeriodo periodo, bool activo = true)
    {
        Update(nombre, slug, precioCent, periodo, activo);
    }

    public void Update(string nombre, Slug slug, int precioCent, PlanPeriodo periodo, bool activo)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido.");
        if (precioCent <= 0) throw new ArgumentException("El precio debe ser mayor que cero.");

        Nombre = nombre;
        Slug = slug.Value;
        PrecioCent = precioCent;
        Periodo = periodo;
        Activo = activo;
    }

    public void SetStripePrice(string priceId)
    {
        StripePriceId = priceId;
    }
}

