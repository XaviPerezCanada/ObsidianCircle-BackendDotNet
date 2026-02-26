using MiProyecto.Application.BoardGames.Dtos;
using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Application.Interfaces;
using MiProyecto.Domain.BoardGames.Entities;
using MiProyecto.Domain.Common.ValueObjects;

namespace MiProyecto.Application.BoardGames.UseCases;

public record CreateBoardGameCommand(
    string Titulo,
    string Socio,
    int JugadoresMin,
    int JugadoresMax,
    string? Descripcion,
    string? Genero,
    int? EdadRecomendada,
    int? DuracionMinutos,
    string? Categoria,
    string? Ubicacion,
    string? Observaciones,
    string? Editorial
);

public class CreateBoardGameHandler
{
    private readonly ISlugGenerator _slugGenerator;

    public CreateBoardGameHandler(ISlugGenerator slugGenerator)
    {
        _slugGenerator = slugGenerator;
    }

    public BoardGame Handle(CreateBoardGameCommand command)
    {
        var slug = _slugGenerator.Generate(command.Titulo);

        var boardGame = new BoardGame(
            command.Titulo,
            slug,
            command.Socio,
            command.JugadoresMin,
            command.JugadoresMax
        );

        boardGame.SetDescripcion(command.Descripcion);
        boardGame.SetGenero(command.Genero);
        boardGame.SetEdadRecomendada(command.EdadRecomendada);
        boardGame.SetDuracionMinutos(command.DuracionMinutos);
        boardGame.SetCategoria(command.Categoria);
        boardGame.SetUbicacion(command.Ubicacion);
        boardGame.SetObservaciones(command.Observaciones);
        boardGame.SetEditorial(command.Editorial);

        return boardGame;
    }
}

