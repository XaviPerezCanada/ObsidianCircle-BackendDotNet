using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.BoardGames.Exceptions;

namespace MiProyecto.Domain.Common.ValueObjects;

public sealed class UserType : ValueObject
{
    public static readonly UserType Admin = new("ADMIN");
    public static readonly UserType Socio = new("SOCIO");
    public static readonly UserType Basico = new("BASICO");

    public string Value { get; }

    private UserType(string value)
    {
        Value = value;
    }

    public static UserType From(string value)
    {
        var normalized = value?.Trim().ToUpperInvariant();

        return normalized switch
        {
            "ADMIN" => Admin,
            "SOCIO" => Socio,
            "BASICO" => Basico,
            _ => throw new DomainException($"Tipo de usuario inválido: {value}")
        };
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
