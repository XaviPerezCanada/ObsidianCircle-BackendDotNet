# Guía de Manejo de Excepciones

Este documento explica cómo usar el sistema de manejo de excepciones profesional implementado en el proyecto.

## Estructura

### 1. Excepciones Personalizadas (Domain/Common/Exceptions)

- **`NotFoundException`**: Para recursos no encontrados (404)
- **`ValidationException`**: Para errores de validación con múltiples campos (400)
- **`BusinessException`**: Para errores de lógica de negocio (400)
- **`DomainException`**: Para errores de dominio (ya existente)

### 2. Middleware Global

El `ExceptionHandlingMiddleware` captura automáticamente todas las excepciones y las convierte en respuestas JSON estructuradas.

### 3. Formato de Respuesta de Error

Todas las respuestas de error siguen este formato:

```json
{
  "title": "Error de validación",
  "status": 400,
  "detail": "Uno o más errores de validación han ocurrido.",
  "errors": {
    "name": ["El nombre es obligatorio"],
    "capacity": ["La capacidad debe ser mayor que 0"]
  },
  "errorCode": null,
  "traceId": "0HN1234567890",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Ejemplos de Uso

### En el Servicio (Application Layer)

```csharp
public async Task<GameRoomDto> GetRoomByIdAsync(Guid id)
{
    var room = await _repository.GetByIdAsync(id);
    if (room == null) 
        throw new NotFoundException("GameRoom", id);
    
    return new GameRoomDto(...);
}
```

### En el Dominio (Domain Layer)

```csharp
public void Update(string name, int capacity)
{
    if (string.IsNullOrWhiteSpace(name))
        throw new ValidationException("name", "El nombre no puede estar vacío.");
    
    if (capacity <= 0)
        throw new ValidationException("capacity", "La capacidad debe ser positiva.");
    
    Name = name;
    Capacity = capacity;
}
```

### Validación con Múltiples Errores

```csharp
var errors = new Dictionary<string, string[]>();
if (string.IsNullOrWhiteSpace(dto.Name))
    errors.Add("name", new[] { "El nombre es obligatorio" });
if (dto.Capacity <= 0)
    errors.Add("capacity", new[] { "La capacidad debe ser mayor que 0" });

if (errors.Any())
    throw new ValidationException(errors);
```

### Errores de Negocio

```csharp
if (room.Status == RoomStatus.UnderMaintenance)
    throw new BusinessException("La sala está en mantenimiento y no puede ser reservada.", "ROOM_MAINTENANCE");
```

## En el Controlador

**Ya no necesitas try-catch!** El middleware maneja todo automáticamente:

```csharp
[HttpGet("{id}")]
public async Task<ActionResult<GameRoomDto>> GetById(Guid id)
{
    // Si no existe, NotFoundException se lanza y el middleware la convierte en 404
    var room = await _service.GetRoomByIdAsync(id);
    return Ok(room);
}
```

## Códigos de Estado HTTP

- **400 Bad Request**: `ValidationException`, `BusinessException`, `DomainException`, `ArgumentException`
- **404 Not Found**: `NotFoundException`, `KeyNotFoundException`
- **500 Internal Server Error**: Cualquier otra excepción no manejada

## Ventajas

1. ✅ **Código más limpio**: No necesitas try-catch en cada controlador
2. ✅ **Respuestas consistentes**: Todas las respuestas de error tienen el mismo formato
3. ✅ **Fácil de depurar**: El `traceId` permite rastrear errores en los logs
4. ✅ **Seguro**: En producción, los detalles internos no se exponen
5. ✅ **Profesional**: Formato estándar que el frontend puede manejar fácilmente
