using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.Users.DTOs;
using MiProyecto.Application.Users.Services;
using MiProyecto.WebApi.Models;
using System.IdentityModel.Tokens.Jwt;

namespace MiProyecto.WebApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AuthController(
    IAuthHandler userHandler,
    IRefreshTokenService refreshTokenService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<UserEnvelope<AuthResponseDto>>> Register(
            RequestEnvelope<UserEnvelope<NewUserDto>> request,
            CancellationToken ct)
        {
            var deviceId = GetDeviceId();
            var auth = await userHandler.CreateAsync(request.Body.User, deviceId, ct);
            return Ok(new UserEnvelope<AuthResponseDto>(auth));
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginUserDto input, CancellationToken ct)
        {
           
            var deviceId = Request.Headers["X-Device-Id"].FirstOrDefault() ?? "unknown";

           
            var result = await userHandler.LoginAsync(input, deviceId, ct);

            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<TokenPairDto>> Refresh(RefreshTokenDto request, CancellationToken ct)
        {
       
            var tokens = await refreshTokenService.RefreshTokensAsync(request.RefreshToken, request.DeviceId, ct);

            return Ok(tokens);
        }

        [HttpPost("revoke")]
        [Authorize]
        public async Task<IActionResult> Revoke(RefreshTokenDto request, CancellationToken ct)
        {
            await refreshTokenService.RevokeRefreshTokenAsync(request.RefreshToken, ct);
            return Ok(new { message = "Token revocado exitosamente" });
        }

        [HttpPost("logout-all")]
        [Authorize]
        public async Task<IActionResult> LogoutAll(CancellationToken ct)
        {
            await refreshTokenService.RevokeAllUserSessionsAsync(GetUserEmail(), ct);
            return Ok(new { message = "Todas las sesiones han sido cerradas" });
        }

        // Helper privado para no repetir código de headers o claims
        private string GetDeviceId() => Request.Headers["X-Device-Id"].FirstOrDefault() ?? Guid.NewGuid().ToString();
        private string GetUserEmail() => User.FindFirst(JwtRegisteredClaimNames.Email)?.Value
            ?? throw new UnauthorizedAccessException("Usuario no autenticado");
    }
}
