using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.Users.DTOs;
using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.Users;
using MiProyecto.Domain.Users.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace MiProyecto.WebApi.Controllers;

[Route("api/admin/[controller]")]
[ApiController]
[Authorize]
public class UsersController(IUserRepository userRepository, IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetAllUsers(CancellationToken ct)
    {
        var currentUser = await GetCurrentUserAsync(ct);
        if (currentUser is null)
        {
            return Unauthorized();
        }

        if (!string.Equals(currentUser.Type.Value, UserType.Admin.Value, StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var users = await userRepository.GetAllAsync(ct);
        var dtos = mapper.Map<IEnumerable<AdminUserDto>>(users);
        return Ok(dtos);
    }

    [HttpPut("{slug}")]
    public async Task<ActionResult<AdminUserDto>> UpdateUser(
        [FromRoute] string slug,
        [FromBody] AdminUpdateUserDto input,
        CancellationToken ct)
    {
        var currentUser = await GetCurrentUserAsync(ct);
        if (currentUser is null)
        {
            return Unauthorized();
        }

        if (!string.Equals(currentUser.Type.Value, UserType.Admin.Value, StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(slug))
        {
            return BadRequest(new { message = "El slug no puede estar vacío." });
        }

        var target = await userRepository.GetBySlugAsync(slug, ct);
        if (target is null)
        {
            return NotFound(new { message = $"No se encontró el usuario con slug '{slug}'." });
        }

        // Seguridad básica: evitar auto-bloqueo del último admin desde aquí
        var isSelf = string.Equals(target.Email, currentUser.Email, StringComparison.OrdinalIgnoreCase);
        if (isSelf && input.Active is false)
        {
            return BadRequest(new { message = "No puedes desactivar tu propio usuario admin." });
        }
        if (isSelf && !string.IsNullOrWhiteSpace(input.Type) &&
            !string.Equals(input.Type.Trim(), UserType.Admin.Value, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "No puedes quitarte el rol ADMIN a ti mismo." });
        }

        if (!string.IsNullOrWhiteSpace(input.Email) &&
            !string.Equals(input.Email, target.Email, StringComparison.OrdinalIgnoreCase))
        {
            var emailInUse = await userRepository.ExistsEmailAsync(input.Email, ct);
            if (emailInUse)
            {
                return Conflict(new { message = $"El email '{input.Email}' ya está registrado." });
            }
        }

        target.UpdateProfile(input.Username, input.Email, input.Bio, input.Image);

        if (!string.IsNullOrWhiteSpace(input.Type))
        {
            target.SetType(UserType.From(input.Type));
        }

        if (input.Active is true)
        {
            target.Activate();
        }
        else if (input.Active is false)
        {
            target.Deactivate();
        }

        await userRepository.UpdateAsync(target, ct);

        var dto = mapper.Map<AdminUserDto>(target);
        return Ok(dto);
    }

    private async Task<User?> GetCurrentUserAsync(CancellationToken ct)
    {
        var identifier = GetUserIdentifier();
        if (string.IsNullOrWhiteSpace(identifier))
        {
            return null;
        }

        var user = await userRepository.GetByEmailAsync(identifier, ct);
        if (user is not null)
        {
            return user;
        }

        user = await userRepository.GetByUsernameAsync(identifier, ct);
        return user;
    }

    private string GetUserIdentifier()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (!string.IsNullOrWhiteSpace(email))
            return email;

        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst(ClaimTypes.Name)?.Value;

        if (!string.IsNullOrWhiteSpace(username))
            return username;

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

