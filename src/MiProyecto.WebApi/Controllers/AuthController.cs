using Azure.Core;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.Users.DTOs;
using MiProyecto.Application.Users.Services;
using MiProyecto.WebApi.Models;
using System.IdentityModel.Tokens.Jwt;

namespace MiProyecto.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(
        IAuthHandler userHandler,
        IRefreshTokenService refreshTokenService) : ControllerBase
    {
        private const string RefreshTokenCookieName = "refreshToken";

        [HttpPost("register")]
        public async Task<ActionResult<UserEnvelope<AuthResponseDto>>> Register(
            RequestEnvelope<UserEnvelope<NewUserDto>> request,
            CancellationToken ct)
        {
            var deviceId = GetDeviceId();
            // 1. El handler devuelve el AuthResult (con el refresh token)
            var auth = await userHandler.CreateAsync(request.Body.User, deviceId, ct);

            // 2. Guardamos el refresh token en la cookie
            SetRefreshTokenCookie(auth.RefreshToken);

            // 3. Creamos el DTO de salida usando los datos de 'auth'
            var responseDto = new AuthResponseDto(auth.AccessToken, auth.User);

            // 4. Devolvemos el sobre con el DTO limpio
            return Ok(new UserEnvelope<AuthResponseDto>(responseDto));
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginUserDto input, CancellationToken ct)
        {
            var deviceId = GetDeviceId();

           
            AuthResult result = await userHandler.LoginAsync(input, deviceId, ct);

        
            SetRefreshTokenCookie(result.RefreshToken);

           
            var response = new AuthResponseDto(result.AccessToken, result.User);

            return Ok(response);
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponseDto>> Refresh(CancellationToken ct)
        {
            var refreshToken = Request.Cookies[RefreshTokenCookieName];

            if (string.IsNullOrWhiteSpace(refreshToken))
                return Unauthorized(new { message = "Sesión expirada" });

            var deviceId = GetDeviceId();

            
            var tokenPair = await refreshTokenService.RefreshTokensAsync(refreshToken, deviceId, ct);

            
            SetRefreshTokenCookie(tokenPair.RefreshToken);

            
            return Ok(new AuthResponseDto(tokenPair.AccessToken, tokenPair.User));
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

            // Opcional: limpiar cookie de refresh token
            var opts = BuildRefreshTokenCookieOptions();
            Response.Cookies.Delete(RefreshTokenCookieName, new CookieOptions
            {
                Path = opts.Path,
                Secure = opts.Secure,
                SameSite = opts.SameSite,
            });

            return Ok(new { message = "Todas las sesiones han sido cerradas" });
        }

        // Helpers
        private string GetDeviceId() =>
            Request.Headers["X-Device-Id"].FirstOrDefault() ?? Guid.NewGuid().ToString();

        private string GetUserEmail() =>
            User.FindFirst(JwtRegisteredClaimNames.Email)?.Value
                ?? throw new UnauthorizedAccessException("Usuario no autenticado");

        private void SetRefreshTokenCookie(string refreshToken)
        {
            var cookieOptions = BuildRefreshTokenCookieOptions();
            Response.Cookies.Append(RefreshTokenCookieName, refreshToken, cookieOptions);
        }

        private CookieOptions BuildRefreshTokenCookieOptions()
        {
            // Nota: Chrome usa "schemeful same-site". Si el front es http:// y la API https://,
            // entonces SameSite=Lax se considera cross-site y el navegador bloquea Set-Cookie.
            // En ese caso necesitamos SameSite=None + Secure=true.

            var sameSite = SameSiteMode.Lax;
            var secure = false;

            if (Request.IsHttps)
            {
                secure = true;

                var origin = Request.Headers["Origin"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(origin) && Uri.TryCreate(origin, UriKind.Absolute, out var originUri))
                {
                    var crossSite =
                        !string.Equals(originUri.Scheme, Request.Scheme, StringComparison.OrdinalIgnoreCase) ||
                        !string.Equals(originUri.Host, Request.Host.Host, StringComparison.OrdinalIgnoreCase);

                    if (crossSite)
                    {
                        sameSite = SameSiteMode.None;
                    }
                }
            }

            return new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = sameSite,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                IsEssential = true,
            };
        }

        //private void SetRefreshTokenCookie(string refreshToken)
        //{
        //    var isDev = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

        //    var cookieOptions = new CookieOptions
        //    {
        //        HttpOnly = true,
        //        Secure = !isDev,                     // en Development: false (HTTP), en producción: true
        //        SameSite = isDev
        //            ? SameSiteMode.Lax              // suficiente para mismo origen vía proxy
        //            : SameSiteMode.None,            // para prod con front separado en HTTPS
        //        Expires = DateTimeOffset.UtcNow.AddDays(7),
        //    };

        //    Response.Cookies.Append(RefreshTokenCookieName, refreshToken, cookieOptions);
        //}

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            var opts = BuildRefreshTokenCookieOptions();
            Response.Cookies.Delete(RefreshTokenCookieName, new CookieOptions
            {
                Path = opts.Path,
                Secure = opts.Secure,
                SameSite = opts.SameSite,
            });
          
            return Ok();
        }
    }
}