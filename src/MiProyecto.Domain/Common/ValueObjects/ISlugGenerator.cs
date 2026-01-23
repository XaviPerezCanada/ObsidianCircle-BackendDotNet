namespace MiProyecto.Domain.Common.ValueObjects;

public interface ISlugGenerator
{
    string Generate(string text);
}
