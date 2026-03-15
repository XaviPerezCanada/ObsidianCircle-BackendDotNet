using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.Common;
using MiProyecto.Application.Reservations.Dtos;
using MiProyecto.Application.Reservations.Interfaces;
using MiProyecto.Application.Reservations.Services.CancelReservation;
using MiProyecto.Application.Reservations.UseCases.CreateReservation;
using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.Reservation;
using MiProyecto.Domain.Reservation.Entities;
using MiProyecto.Domain.Users;
using MiProyecto.Domain.Users.Interfaces;

namespace MiProyecto.WebApi.Controllers;

[ApiController]
[Route("api/reservations")]
[Authorize]
public class ReservationsController : ControllerBase
{
    private readonly CreateReservationHandler _createHandler;
    private readonly CancelReservationHandler _cancelHandler;
    private readonly IReservationRepository _reservationRepository;
    private readonly IUserRepository _userRepository;

    public ReservationsController(
        CreateReservationHandler createHandler,
        CancelReservationHandler cancelHandler,
        IReservationRepository reservationRepository,
        IUserRepository userRepository)
    {
        _createHandler = createHandler;
        _cancelHandler = cancelHandler;
        _reservationRepository = reservationRepository;
        _userRepository = userRepository;
    }

    // POST api/reservations
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReservationRequest request, CancellationToken ct)
    {
        var currentUser = await GetCurrentUserAsync(ct);
        if (currentUser is null)
            return Unauthorized();

        var userId = UserIdFromEmail.ToGuid(currentUser.Email);
        var requestWithUser = new CreateReservationRequest
        {
            GameRoomId = request.GameRoomId,
            UserId = userId,
            Date = request.Date,
            Slot = request.Slot,
            BoardGameId = request.BoardGameId
        };

        var result = await _createHandler.HandleAsync(requestWithUser);

        if (!result.IsSuccess)
        {
            if (result.Error!.Contains("reservada"))
                return Conflict(new { error = result.Error });

            return BadRequest(new { error = result.Error });
        }
        return CreatedAtAction(
            nameof(GetBySlug),
            new { slugOrId = result.Value!.Slug },
            result.Value
        );
    }

    /// <summary>
    /// Reservas del usuario autenticado (Socio o cualquier usuario logueado).
    /// </summary>
    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<ReservationResponse>>> GetMine(CancellationToken ct)
    {
        var currentUser = await GetCurrentUserAsync(ct);
        if (currentUser is null)
            return Unauthorized();

        var userId = UserIdFromEmail.ToGuid(currentUser.Email);
        var reservations = await _reservationRepository.GetByUserIdAsync(userId, ct);
        var dtos = reservations.Select(MapToResponse).ToList();
        return Ok(dtos);
    }

    /// <summary>
    /// Reservas de una sala para una fecha (para mostrar ocupación del día).
    /// </summary>
    [HttpGet("by-date")]
    public async Task<ActionResult<IEnumerable<ReservationResponse>>> GetByDateAndRoom(
        [FromQuery] DateOnly date,
        [FromQuery] Guid gameRoomId,
        CancellationToken ct)
    {
        if (gameRoomId == Guid.Empty)
            return BadRequest(new { error = "gameRoomId es obligatorio." });

        var reservations = await _reservationRepository.GetByDateAndRoomAsync(date, gameRoomId, ct);
        var dtos = reservations.Select(MapToResponse).ToList();
        return Ok(dtos);
    }

    /// <summary>
    /// Todas las reservas (solo Admin).
    /// </summary>
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<ReservationResponse>>> GetAll(CancellationToken ct)
    {
        var currentUser = await GetCurrentUserAsync(ct);
        if (currentUser is null)
            return Unauthorized();

        if (!string.Equals(currentUser.Type.Value, UserType.Admin.Value, StringComparison.OrdinalIgnoreCase))
            return Forbid();

        var reservations = await _reservationRepository.GetAllAsync(ct);
        var dtos = reservations.Select(MapToResponse).ToList();
        return Ok(dtos);
    }

    /// <summary>
    /// Obtiene una reserva por slug (32 caracteres hex) o por id (Guid con guiones).
    /// </summary>
    [HttpGet("{slugOrId}")]
    public async Task<ActionResult<ReservationResponse>> GetBySlug(string slugOrId, CancellationToken ct)
    {
        var reservation = await _reservationRepository.GetBySlugAsync(slugOrId, ct);
        if (reservation is null && Guid.TryParse(slugOrId, out var id))
            reservation = await _reservationRepository.GetByIdAsync(id);
        if (reservation is null)
            return NotFound(new { error = "Reserva no encontrada." });

        return Ok(MapToResponse(reservation));
    }

    /// <summary>
    /// Cancela una reserva por slug o por id (Guid).
    /// </summary>
    [HttpDelete("{slugOrId}")]
    public async Task<IActionResult> Cancel(string slugOrId, CancellationToken ct)
    {
        var reservation = await _reservationRepository.GetBySlugWithBlocksAsync(slugOrId, ct);
        if (reservation is null && Guid.TryParse(slugOrId, out var id))
            reservation = await _reservationRepository.GetByIdWithBlocksAsync(id);
        if (reservation is null)
            return NotFound(new { error = "Reserva no encontrada." });

        var result = await _cancelHandler.HandleAsync(reservation.Id);
        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return NoContent();
    }

    private async Task<User?> GetCurrentUserAsync(CancellationToken ct)
    {
        var identifier = GetUserIdentifier();
        if (string.IsNullOrWhiteSpace(identifier))
            return null;

        var user = await _userRepository.GetByEmailAsync(identifier, ct);
        if (user is not null)
            return user;

        user = await _userRepository.GetByUsernameAsync(identifier, ct);
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

    private static ReservationResponse MapToResponse(Reservation r) => new()
    {
        Id = r.Id,
        Slug = r.Slug,
        GameRoomId = r.GameRoomId,
        UserId = r.UserId,
        Date = r.Date,
        Slot = r.Franja,
        Estado = r.Estado,
        BoardGameId = r.BoardGameId
    };
}
