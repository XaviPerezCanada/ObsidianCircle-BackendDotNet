namespace MiProyecto.Domain.Common.Exceptions;

public class ValidationException : Exception
{
    public Dictionary<string, string[]> Errors { get; }
    
    public ValidationException() : base("Uno o más errores de validación han ocurrido.")
    {
        Errors = new Dictionary<string, string[]>();
    }
    
    public ValidationException(string message) : base(message)
    {
        Errors = new Dictionary<string, string[]>();
    }
    
    public ValidationException(Dictionary<string, string[]> errors) : this()
    {
        Errors = errors;
    }
    
    public ValidationException(string field, string error) : this()
    {
        Errors.Add(field, new[] { error });
    }
}
