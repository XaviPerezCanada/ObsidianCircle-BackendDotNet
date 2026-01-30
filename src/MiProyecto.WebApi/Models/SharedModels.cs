using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace MiProyecto.WebApi.Models { 
public record RequestEnvelope<T>
{
    [Required][FromBody] public T Body { get; init; } = default!;
}
}

