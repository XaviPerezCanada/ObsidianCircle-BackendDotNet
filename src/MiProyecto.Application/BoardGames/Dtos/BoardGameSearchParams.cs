namespace MiProyecto.Application.BoardGames.Dtos;

public sealed class BoardGameSearchParams
{
    /// <summary>Texto de búsqueda (título, slug, descripción, género, editorial).</summary>
    public string? Q { get; init; }

    /// <summary>Número de jugadores: filtrar juegos que admitan al menos este número (JugadoresMin &lt;= Jugadores &lt;= JugadoresMax).</summary>
    public int? Jugadores { get; init; }

    /// <summary>Orden: titulo_asc, titulo_desc, o por defecto por Id.</summary>
    public string? Sort { get; init; }

    public int Page { get; init; } = 1;
    public int Limit { get; init; } = 10;
}
