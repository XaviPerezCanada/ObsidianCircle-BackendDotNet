using MiProyecto.Domain.BoardGames.Exceptions;
using MiProyecto.Application.Users.Exceptions;
using MiProyecto.Domain.Common.Exceptions;
using MiProyecto.WebApi.Common;
using System.Net;
using System.Text.Json;

namespace MiProyecto.WebApi.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no manejado: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = new ErrorResponse
        {
            TraceId = context.TraceIdentifier,
            Timestamp = DateTime.UtcNow
        };

        switch (exception)
        {
            
            case InvalidCredentialsException authEx:
                errorResponse.Status = (int)HttpStatusCode.Unauthorized;
                errorResponse.Title = "Credenciales inválidas";
                errorResponse.Detail = authEx.Message;
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                break;

            case InvalidRefreshTokenException refreshEx:
                errorResponse.Status = (int)HttpStatusCode.Unauthorized;
                errorResponse.Title = "Token de refresco inválido";
                errorResponse.Detail = refreshEx.Message;
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                break;

            case UnauthorizedAccessException:
                errorResponse.Status = (int)HttpStatusCode.Unauthorized;
                errorResponse.Title = "No autorizado";
                errorResponse.Detail = "Debe estar autenticado para realizar esta acción.";
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                break;

            
            case NotFoundException notFoundEx:
                errorResponse.Status = (int)HttpStatusCode.NotFound;
                errorResponse.Title = "Recurso no encontrado";
                errorResponse.Detail = notFoundEx.Message;
                response.StatusCode = (int)HttpStatusCode.NotFound;
                break;

            case ValidationException validationEx:
                errorResponse.Status = (int)HttpStatusCode.BadRequest;
                errorResponse.Title = "Error de validación";
                errorResponse.Detail = "Uno o más errores de validación han ocurrido.";
                errorResponse.Errors = validationEx.Errors; 
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case BusinessException businessEx:
                errorResponse.Status = (int)HttpStatusCode.BadRequest;
                errorResponse.Title = "Operación no permitida";
                errorResponse.Detail = businessEx.Message;
                errorResponse.ErrorCode = businessEx.ErrorCode;
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            

            default:
                errorResponse.Status = (int)HttpStatusCode.InternalServerError;
                errorResponse.Title = "Error interno del servidor";
                errorResponse.Detail = _environment.IsDevelopment()
                    ? exception.ToString()
                    : "Ha ocurrido un error inesperado.";
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                break;
        }

       
        var jsonResponse = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        await response.WriteAsync(jsonResponse);
    }
}
