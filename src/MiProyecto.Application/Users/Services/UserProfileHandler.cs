using AutoMapper;
using MiProyecto.Application.BoardGames.Dtos;
using MiProyecto.Application.BoardGames.Interfaces;
using MiProyecto.Application.Users.DTOs;
using MiProyecto.Application.Users.Exceptions;
using MiProyecto.Domain.BoardGames.Entities;
using MiProyecto.Domain.Common.Exceptions;
using MiProyecto.Domain.Users;
using MiProyecto.Domain.Users.Interfaces;

namespace MiProyecto.Application.Users.Services;

public interface IUserProfileHandler
{
    /// <summary>
    /// Obtiene el usuario actual a partir de un identificador (email o username).
    /// </summary>
    Task<UserDto> GetCurrentUserAsync(string identifier, CancellationToken ct);

    /// <summary>
    /// Actualiza el usuario actual a partir de un identificador (email o username).
    /// </summary>
    Task<UserDto> UpdateCurrentUserAsync(string identifier, UpdateUserDto input, CancellationToken ct);

    /// <summary>
    /// Obtiene los juegos de mesa asociados al usuario identificado (sus juegos cedidos).
    /// </summary>
    Task<IEnumerable<BoardGameDto>> GetUserBoardGamesAsync(string identifier, CancellationToken ct);
}

public class UserProfileHandler(
    IUserRepository userRepository,
    IBoardGameRepository boardGameRepository,
    IMapper mapper) : IUserProfileHandler
{
    private async Task<User?> FindUserByIdentifierAsync(string identifier, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(identifier))
        {
            return null;
        }

        // Primero intentamos por email
        var user = await userRepository.GetByEmailAsync(identifier, ct);
        if (user is not null) return user;

        // Si no existe por email, intentamos por username (sub del JWT)
        user = await userRepository.GetByUsernameAsync(identifier, ct);
        return user;
    }

    public async Task<UserDto> GetCurrentUserAsync(string identifier, CancellationToken ct)
    {
        var user = await FindUserByIdentifierAsync(identifier, ct);
        if (user is null)
        {
            throw new NotFoundException($"No se encontró el usuario con identificador '{identifier}'.");
        }

        return mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateCurrentUserAsync(string identifier, UpdateUserDto input, CancellationToken ct)
    {
        var user = await FindUserByIdentifierAsync(identifier, ct);
        if (user is null)
        {
            throw new NotFoundException($"No se encontró el usuario con identificador '{identifier}'.");
        }

        if (!string.IsNullOrWhiteSpace(input.Email) &&
            !string.Equals(input.Email, user.Email, StringComparison.OrdinalIgnoreCase))
        {
            var emailInUse = await userRepository.ExistsEmailAsync(input.Email, ct);
            if (emailInUse)
            {
                throw new ConflictException($"El email '{input.Email}' ya está registrado.");
            }
        }

        user.UpdateProfile(input.Username, input.Email, input.Bio, input.Image);

        await userRepository.UpdateAsync(user, ct);

        return mapper.Map<UserDto>(user);
    }

    public async Task<IEnumerable<BoardGameDto>> GetUserBoardGamesAsync(string identifier, CancellationToken ct)
    {
        var user = await FindUserByIdentifierAsync(identifier, ct);
        if (user is null)
        {
            throw new NotFoundException($"No se encontró el usuario con identificador '{identifier}'.");
        }

        // Usamos el Username como clave que se guarda en BoardGame.Socio
        var socioKey = user.Username;
        var games = await boardGameRepository.GetBySocioAsync(socioKey, ct);

        return games.Select(MapToBoardGameDto).ToList();
    }

    private static BoardGameDto MapToBoardGameDto(BoardGame g)
    {
        return new BoardGameDto(
            g.Id,
            g.Titulo,
            g.Slug,
            g.Socio,
            g.Editorial,
            g.Genero,
            g.JugadoresMin,
            g.JugadoresMax,
            g.EdadRecomendada,
            g.DuracionMinutos,
            g.Categoria,
            g.Ubicacion,
            g.Idioma,
            g.ImagenUrl,
            g.Observaciones,
            g.Estado,
            g.Disponibilidad,
            g.FechaRegistro,
            g.FechaUltimaModificacion
        );
    }
}

