using MiProyecto.Application.BoardGames.Dtos;
using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Application.Interfaces;
using MiProyecto.Domain.BoardGames.Entities;

namespace MiProyecto.Application.BoardGames.UseCases;

public record CreateBoardGameCommand(
    string Titulo,
    string Socio,
    int JugadoresMin,
    int JugadoresMax
);

public class CreateBoardGameHandler
{
    private readonly IBoardGameRepository _repo;
    private readonly ISqlUnitOfWork _uow;

    public CreateBoardGameHandler(IBoardGameRepository repo, ISqlUnitOfWork uow) 
    {   _repo = repo;
        _uow = uow;
        }
    public async Task<BoardGameDto> Handle(CreateBoardGameCommand cmd, CancellationToken ct = default)
    {
        var entity = new BoardGame(cmd.Titulo, cmd.Socio, cmd.JugadoresMin, cmd.JugadoresMax);

        await _repo.AddAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);


        return new BoardGameDto(
            entity.Id,
            entity.Titulo,
            entity.Socio,
            entity.Editorial,
            entity.Genero,
            entity.JugadoresMin,
            entity.JugadoresMax,
            entity.EdadRecomendada,
            entity.DuracionMinutos,
            entity.Ubicacion,
            entity.Idioma,
            entity.ImagenUrl,
            entity.Observaciones,
            entity.Estado,
            entity.Disponibilidad,
            entity.FechaRegistro
        );
    }
}
