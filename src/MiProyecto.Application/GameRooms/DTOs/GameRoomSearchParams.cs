namespace MiProyecto.Application.GameRooms.DTOs;

public sealed class GameRoomSearchParams
{
    /// <summary>Texto de búsqueda (nombre, slug o descripción).</summary>
    public string? Q { get; init; }

    /// <summary>Filtrar por capacidades (ej: [4, 6, 8]).</summary>
    public IEnumerable<int>? Capacity { get; init; }

    /// <summary>Orden: nombre_asc, nombre_desc, o por defecto por Id.</summary>
    public string? Sort { get; init; }

    public int Page { get; init; } = 1;
    public int Limit { get; init; } = 10;
}
