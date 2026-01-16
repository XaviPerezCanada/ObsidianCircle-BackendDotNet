# Guía para Probar el Backend de Reservas

## 1. Iniciar el servidor FastAPI

```powershell
cd backend-fastAPI
.\start_server.ps1
```

O manualmente:
```powershell
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## 2. Acceder a la documentación interactiva

Abre en el navegador:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 3. Endpoints disponibles

### GameRooms (Ya existentes)
- `GET /api/gamerooms/` - Obtener todas las salas
- `GET /api/gamerooms/{id}` - Obtener sala por ID
- `GET /api/gamerooms/slug/{slug}` - Obtener sala por slug
- `POST /api/gamerooms/` - Crear nueva sala

### Bookings (Nuevos)
- `GET /api/bookings/` - Obtener todas las reservas
- `GET /api/bookings/{id}` - Obtener reserva por ID
- `GET /api/bookings/game-room/{game_room_id}` - Obtener reservas por sala
- `POST /api/bookings/` - Crear nueva reserva

## 4. Ejemplo de prueba con cURL

### Paso 1: Crear una sala (si no existe)
```bash
curl -X POST "http://localhost:8000/api/gamerooms/" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "sala-principal",
    "nombre": "Sala Principal",
    "capacidad": 10,
    "precio": 15.50,
    "status": "activa"
  }'
```

### Paso 2: Crear una reserva
```bash
curl -X POST "http://localhost:8000/api/bookings/" \
  -H "Content-Type: application/json" \
  -d '{
    "game_room_id": 1,
    "titulo": "Reunión de equipo",
    "descripcion": "Reunión mensual del equipo",
    "fecha_inicio": "2024-02-15T10:00:00Z",
    "fecha_fin": "2024-02-15T12:00:00Z",
    "usuario": "juan.perez"
  }'
```

### Paso 3: Obtener todas las reservas
```bash
curl "http://localhost:8000/api/bookings/"
```

### Paso 4: Obtener reservas de una sala específica
```bash
curl "http://localhost:8000/api/bookings/game-room/1"
```

## 5. Ejemplo de prueba con PowerShell

### Crear una reserva
```powershell
$body = @{
    game_room_id = 1
    titulo = "Torneo de ajedrez"
    descripcion = "Torneo mensual"
    fecha_inicio = "2024-02-20T14:00:00Z"
    fecha_fin = "2024-02-20T18:00:00Z"
    usuario = "maria.garcia"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/bookings/" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Obtener reservas de una sala
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/bookings/game-room/1" `
  -Method GET
```

## 6. Verificar en la base de datos

La base de datos SQLite se encuentra en: `backend-fastAPI/game_rooms.db`

Puedes verificar las tablas creadas:
```powershell
sqlite3 game_rooms.db
.tables
.schema bookings
SELECT * FROM bookings;
```

## Notas importantes

1. **Primero necesitas tener salas creadas** antes de crear reservas (la foreign key `game_room_id` debe existir)
2. **Las fechas deben estar en formato ISO 8601** (ej: `2024-02-15T10:00:00Z`)
3. **La fecha de fin debe ser posterior a la fecha de inicio** (validación automática)
4. **La documentación en `/docs` es la mejor manera de probar** los endpoints interactivamente
