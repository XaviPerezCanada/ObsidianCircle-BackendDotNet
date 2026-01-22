using System.Net;
using System.Text.Json;
using MiProyecto.Domain.BoardGames.Exceptions;
using MiProyecto.Domain.Common.Exceptions;
using MiProyecto.WebApi.Common;

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
            case NotFoundException notFoundEx:
                errorResponse.Status = (int)HttpStatusCode.NotFound;
                errorResponse.Title = "Recurso no encontrado";
                errorResponse.Detail = notFoundEx.Message;
                response.StatusCode = (int)HttpStatusCode.NotFound;
                break;

            case ValidationException validationEx:
                errorResponse.Status = (int)HttpStatusCode.BadRequest;
                errorResponse.Title = "Error de validación";
                errorResponse.Detail = validationEx.Message;
                errorResponse.Errors = validationEx.Errors;
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case BusinessException businessEx:
                errorResponse.Status = (int)HttpStatusCode.BadRequest;
                errorResponse.Title = "Error de negocio";
                errorResponse.Detail = businessEx.Message;
                errorResponse.ErrorCode = businessEx.ErrorCode;
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case DomainException domainEx:
                errorResponse.Status = (int)HttpStatusCode.BadRequest;
                errorResponse.Title = "Error de dominio";
                errorResponse.Detail = domainEx.Message;
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case ArgumentException argEx:
                errorResponse.Status = (int)HttpStatusCode.BadRequest;
                errorResponse.Title = "Error de argumento";
                errorResponse.Detail = argEx.Message;
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case KeyNotFoundException keyNotFoundEx:
                errorResponse.Status = (int)HttpStatusCode.NotFound;
                errorResponse.Title = "Recurso no encontrado";
                errorResponse.Detail = keyNotFoundEx.Message;
                response.StatusCode = (int)HttpStatusCode.NotFound;
                break;

            default:
                errorResponse.Status = (int)HttpStatusCode.InternalServerError;
                errorResponse.Title = "Error interno del servidor";
                errorResponse.Detail = _environment.IsDevelopment() 
                    ? exception.ToString() 
                    : "Ha ocurrido un error inesperado. Por favor, contacte al administrador.";
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                break;
        }

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        var jsonResponse = JsonSerializer.Serialize(errorResponse, jsonOptions);
        await response.WriteAsync(jsonResponse);
    }
}
