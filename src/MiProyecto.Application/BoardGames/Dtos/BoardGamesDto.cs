using MiProyecto.Domain.BoardGames.Enums;

namespace MiProyecto.Application.BoardGames.Dtos
{
    public record BoardGameDto(
        int Id,
        string Titulo,
        string Socio,
        string Editorial,
        string Genero,
        int JugadoresMin,
        int JugadoresMax,
        int EdadRecomendada,
        int DuracionMinutos,
        string Ubicacion,
        string Idioma,
        string ImagenUrl,
        string Observaciones,
        PhysicalStatus Estado,
        LoanStatus Disponibilidad,
        DateTime FechaRegistro
    );
}
