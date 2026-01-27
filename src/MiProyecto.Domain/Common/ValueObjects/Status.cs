namespace MiProyecto.Domain.Common.ValueObjects;
public sealed class Status : ValueObject

{
    public static readonly Status Active = new("Active");
    public static readonly Status Inactive = new("Inactive");
    public static readonly Status UnderMaintenance = new("UnderMaintenance");

    public string Value { get; }

    private Status(string value)
    {
        Value = value;
    }

    public static Status From(string value)
    {
        return value switch
        {
            "Active" => Active,
            "Inactive" => Inactive,
            "UnderMaintenance" => UnderMaintenance,
            _ => throw new ArgumentException($"Invalid Status value: {value}")
        };
    }

    public bool IsActive => this == Active;
    public bool IsInactive => this == Inactive;

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}

