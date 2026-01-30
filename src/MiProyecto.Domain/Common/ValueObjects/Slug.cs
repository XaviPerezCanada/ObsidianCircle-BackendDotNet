namespace MiProyecto.Domain.Common.ValueObjects;

public sealed record Slug(string Value)
{
    public static Slug From(string text, ISlugGenerator generator)
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("No se puede generar slug de un texto vacío.", nameof(text));

        return new Slug(generator.Generate(text));
    }

    public override string ToString() => Value;

    internal Slug From(string slug)
    {
        throw new NotImplementedException();
    }
}
