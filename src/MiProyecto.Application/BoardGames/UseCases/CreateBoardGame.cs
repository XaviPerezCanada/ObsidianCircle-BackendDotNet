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
    int JugadoresMax
);

public class CreateBoardGameHandler
{
    private readonly ISlugGenerator _slugGenerator;

    public CreateBoardGameHandler(ISlugGenerator slugGenerator)
    {
        _slugGenerator = slugGenerator;
    }
    public BoardGame Handle(string titulo, string socio, int jugadoresMin, int jugadoresMax)
    {  
        var slug = _slugGenerator.Generate(titulo);
 
        var boardGame = new BoardGame(
            titulo,
            slug,
            socio,
            jugadoresMin,
            jugadoresMax
        );

        return boardGame;
    }
}

