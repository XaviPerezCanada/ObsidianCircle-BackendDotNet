using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.Users.DTOs;
using MiProyecto.Application.Users.Services;
using MiProyecto.WebApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace MiProyecto.WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProfileController(IUserProfileHandler profileHandler) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserEnvelope<UserDto>>> GetProfile(CancellationToken ct)
    {
        foreach (var c in User.Claims)
        {
            Console.WriteLine($"CLAIM: {c.Type} = {c.Value}");
        }

        var identifier = GetUserIdentifier();
        var user = await profileHandler.GetCurrentUserAsync(identifier, ct);
        return Ok(new UserEnvelope<UserDto>(user));
    }

    [HttpPut]
    public async Task<ActionResult<UserEnvelope<UserDto>>> UpdateProfile(
        [FromBody] UserEnvelope<UpdateUserDto> request,
        CancellationToken ct)
    {
        var identifier = GetUserIdentifier();
        var updated = await profileHandler.UpdateCurrentUserAsync(identifier, request.User, ct);
        return Ok(new UserEnvelope<UserDto>(updated));
    }

    /// <summary>
    /// Obtiene un identificador de usuario desde el JWT.
    /// Intenta primero el email, y si no existe o está vacío, usa el subject (username).
    /// </summary>

    private string GetUserIdentifier()
    {
        // Primero intentamos con los tipos mapeados por JwtBearer
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (!string.IsNullOrWhiteSpace(email))
            return email;

        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst(ClaimTypes.Name)?.Value;

        if (!string.IsNullOrWhiteSpace(username))
            return username;

        // Fallback por si en algún momento usamos los nombres "puros" del JWT
        email = User.FindFirst(JwtRegisteredClaimNames.Email)?.Value
                ?? User.FindFirst("email")?.Value;
        if (!string.IsNullOrWhiteSpace(email))
            return email;

        username = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                   ?? User.Identity?.Name;
        if (!string.IsNullOrWhiteSpace(username))
            return username;

        throw new UnauthorizedAccessException("Usuario no autenticado");
    }
}

