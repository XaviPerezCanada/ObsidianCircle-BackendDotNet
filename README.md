# ObsidianCircle — Backend .NET

API REST para la gestión de una **ludoteca**: salas de juego, juegos de mesa, reservas, usuarios con roles y pagos mediante Stripe. Construida con **ASP.NET Core (.NET 10)** y arquitectura en capas (Domain / Application / Infrastructure / WebApi).

---

## Índice

1. [Descripción general](#descripción-general)
2. [Tecnologías](#tecnologías)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Requisitos previos](#requisitos-previos)
5. [Configuración](#configuración)
6. [Levantar el entorno](#levantar-el-entorno)
7. [Endpoints de la API](#endpoints-de-la-api)
8. [Autenticación](#autenticación)
9. [Pagos con Stripe](#pagos-con-stripe)
10. [CORS](#cors)
11. [Swagger](#swagger)
12. [Otros servicios del monorepo](#otros-servicios-del-monorepo)

---

## Descripción general

ObsidianCircle es una plataforma de ludoteca que permite:

- **Registrarse y autenticarse** con JWT + refresh token en cookie HttpOnly.
- **Gestionar salas de juego** (crear, buscar, activar/desactivar/poner en mantenimiento).
- **Gestionar juegos de mesa** (catálogo, búsqueda paginada, asignación a usuarios).
- **Realizar y consultar reservas** de franjas horarias en salas, con control de disponibilidad.
- **Administrar usuarios** y sus roles (`Básico`, `Socio`, `Admin`).
- **Contratar planes de suscripción** mediante pago único a través de Stripe Checkout.

---

## Tecnologías

| Área | Tecnología |
|------|------------|
| Lenguaje / Runtime | C# — **.NET 10** |
| Framework web | ASP.NET Core (controladores + middleware) |
| ORM | **EF Core 10** |
| Base de datos principal | **PostgreSQL 16** (`Npgsql.EntityFrameworkCore.PostgreSQL`) |
| Base de datos secundaria | SQL Server 2022 (registrado; actualmente en segundo plano) |
| Autenticación | **JWT Bearer** + Refresh Token en cookie HttpOnly |
| Validación | **FluentValidation** |
| Mapeo | **AutoMapper** |
| Pagos | **Stripe.net** (Checkout Session) |
| Documentación API | **Swagger / Swashbuckle** (entorno Development) |
| Contenedores | **Docker Compose** (Postgres + SQL Server) |

---

## Estructura del proyecto

```
ObsidianCircle-BackendDotNet/
├── src/
│   ├── MiProyecto.Domain/          # Entidades, value objects, interfaces de repositorio, excepciones de dominio
│   ├── MiProyecto.Application/     # DTOs, servicios, handlers, validadores FluentValidation, DependencyInjection
│   ├── MiProyecto.Infrastructure/  # DbContexts (Postgres + SQL Server), migraciones, repositorios, JWT, hash
│   └── MiProyecto.WebApi/          # Program.cs, Controllers, Middleware, appsettings
├── client/                         # Frontend (React + Vite)
├── backend-fastAPI/                # API complementaria en Python
├── backend-notifications/          # Servicio de notificaciones (Node.js — email, SMS, WhatsApp)
├── scripts/                        # Scripts de automatización y SQL
├── docker-compose.yml
└── MiProyecto.slnx
```

---

## Requisitos previos

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para las bases de datos)
- Cuenta de [Stripe](https://stripe.com) con claves de prueba (opcional para pagos)

---

## Configuración

### 1. Variables de entorno / appsettings

El archivo principal de configuración es `src/MiProyecto.WebApi/appsettings.json`. Para desarrollo local se recomienda usar **User Secrets** o un `appsettings.Development.json` sin subir al repositorio.

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=LudotecaDb;User Id=sa;Password=TU_PASSWORD;TrustServerCertificate=True",
    "PostgresConnection": "Host=localhost;Port=5432;Database=LudotecaDb;Username=postgres;Password=TU_PASSWORD"
  },
  "JwtIssuerOptions": {
    "Issuer": "ObsidianCircle",
    "Audience": "ObsidianCircleClient",
    "ValidFor": "60",
    "SecretKey": "TU_CLAVE_SECRETA_JWT"
  },
  "Stripe": {
    "SecretKey": "sk_test_...",
    "PublicKey": "pk_test_...",
    "SuccessUrl": "http://localhost:5173/success",
    "CancelUrl": "http://localhost:5173/cancel"
  }
}
```

> **Nota:** `Program.cs` exige que ambas cadenas de conexión (SQL Server y Postgres) estén presentes al arrancar, aunque el dominio principal opera sobre Postgres.

---

## Levantar el entorno

### 1. Iniciar las bases de datos

```bash
docker-compose up -d
```

Esto levanta PostgreSQL 16 en el puerto `5432` y SQL Server 2022 en el puerto `1433`, ambos con la base de datos `LudotecaDb`.

### 2. Aplicar migraciones

Las migraciones de Postgres se aplican automáticamente al iniciar en entorno `Development`. Para aplicarlas manualmente:

```bash
dotnet ef database update --project src/MiProyecto.Infrastructure --startup-project src/MiProyecto.WebApi
```

### 3. Iniciar la API

```bash
dotnet run --project src/MiProyecto.WebApi
```

La API queda disponible en:
- HTTP: `http://localhost:5222`
- HTTPS: `https://localhost:7200`
- Swagger UI: `http://localhost:5222/swagger`

---

## Endpoints de la API

### Autenticación — `api/Auth`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `api/Auth/register` | Registro de usuario | — |
| POST | `api/Auth/login` | Login; devuelve JWT + cookie `refreshToken` | — |
| POST | `api/Auth/refresh` | Renueva el JWT usando la cookie de refresh | — |
| POST | `api/Auth/revoke` | Revoca el refresh token actual | JWT |
| POST | `api/Auth/logout` | Elimina la cookie de refresh | — |
| POST | `api/Auth/logout-all` | Cierra todas las sesiones del usuario | JWT |

> La cabecera opcional **`X-Device-Id`** identifica el dispositivo/sesión para el refresco de token.

---

### Perfil — `api/Profile` _(requiere JWT)_

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `api/Profile` | Obtener perfil del usuario actual |
| PUT | `api/Profile` | Actualizar perfil |
| GET | `api/Profile/boardgames` | Juegos de mesa cedidos por el usuario |

---

### Salas de juego — `api/GameRooms`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `api/GameRooms` | Listado de salas |
| GET | `api/GameRooms/search` | Búsqueda paginada (`q`, `capacity`, `sort`, `page`, `limit`) |
| GET | `api/GameRooms/available` | Salas disponibles (excluye inactivas) |
| GET | `api/GameRooms/{slug}` | Detalle por slug |
| POST | `api/GameRooms` | Crear sala |
| PUT | `api/GameRooms/{slug}` | Actualizar sala |
| DELETE | `api/GameRooms/{slug}` | Eliminar sala |
| PATCH | `api/GameRooms/{slug}/activate` | Activar sala |
| PATCH | `api/GameRooms/{slug}/deactivate` | Desactivar sala |
| PATCH | `api/GameRooms/{slug}/maintenance` | Poner en mantenimiento |

---

### Juegos de mesa — `api/BoardGames`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `api/BoardGames` | Catálogo completo | — |
| GET | `api/BoardGames/search` | Búsqueda paginada (`q`, `jugadores`, `sort`, `page`, `limit`) | — |
| POST | `api/BoardGames` | Añadir juego | JWT |
| PUT | `api/BoardGames/{slug}` | Actualizar juego | JWT |

---

### Reservas — `api/reservations` _(requiere JWT)_

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `api/reservations` | Crear reserva (asociada al usuario del JWT) |
| GET | `api/reservations/mine` | Reservas del usuario actual |
| GET | `api/reservations/by-date` | Reservas por `date` + `gameRoomId` |
| GET | `api/reservations/all` | Todas las reservas _(solo Admin)_ |
| GET | `api/reservations/{slugOrId}` | Detalle por slug o GUID |
| PUT | `api/reservations/{slugOrId}` | Editar reserva _(solo el propietario)_ |
| DELETE | `api/reservations/{slugOrId}` | Cancelar reserva |

---

### Planes — `api/planes`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `api/planes` | Listado de planes activos |

---

### Suscripciones / Stripe — `api/subscriptions` _(requiere JWT)_

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `api/subscriptions/create-checkout-session` | Crea sesión de pago Stripe (`{ planSlug }`) |
| POST | `api/subscriptions/confirm-payment` | Confirma el pago y promueve al usuario a `Socio` |

---

### Administración de usuarios — `api/admin/Users` _(requiere JWT)_

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `api/admin/Users` | Listado de todos los usuarios |
| PUT | `api/admin/Users/{slug}` | Actualizar usuario (email, tipo, activo, perfil) |

---

### Administración de planes — `api/admin/plans` _(requiere JWT)_

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `api/admin/plans` | Listado de planes (admin) |
| POST | `api/admin/plans` | Crear plan |
| PUT | `api/admin/plans/{id}` | Actualizar plan |

---

## Autenticación

La API usa dos mecanismos complementarios:

1. **JWT Access Token** — enviado en la cabecera `Authorization: Bearer <token>`. Tiene una validez corta (configurable en `JwtIssuerOptions:ValidFor` en minutos).
2. **Refresh Token** — almacenado en una cookie HttpOnly (`refreshToken`). Se usa para obtener un nuevo par de tokens sin que el usuario vuelva a introducir sus credenciales.

Los roles disponibles son: `Básico`, `Socio` y `Admin`.

---

## Pagos con Stripe

El flujo de pago es:

1. El cliente llama a `POST api/subscriptions/create-checkout-session` con el `planSlug` elegido.
2. El backend genera una **Stripe Checkout Session** en modo `payment` (pago único, moneda `EUR`) y devuelve la URL de redirección.
3. El usuario completa el pago en la página de Stripe.
4. El cliente llama a `POST api/subscriptions/confirm-payment` para que el backend promueva al usuario al tipo `Socio`.

> Configura `Stripe:SecretKey` con tu clave de prueba (`sk_test_...`) para entornos de desarrollo.

---

## CORS

En desarrollo se aceptan peticiones desde:
- `http://localhost:5173` (Vite / React)
- `http://localhost:3000`

En producción la política de origen permitido debe actualizarse en `Program.cs`.

---

## Swagger

La documentación interactiva de la API está disponible en entorno `Development`:

```
http://localhost:5222/swagger
```

---

## Otros servicios del monorepo

| Carpeta | Stack | Descripción |
|---------|-------|-------------|
| `client/` | React + Vite | Frontend de la aplicación |
| `backend-fastAPI/` | Python + FastAPI | API complementaria (salas, reservas) |
| `backend-notifications/` | Node.js | Servicio de notificaciones (email, SMS, WhatsApp) |
| `scripts/` | PowerShell + SQL | Scripts de automatización y pruebas |
