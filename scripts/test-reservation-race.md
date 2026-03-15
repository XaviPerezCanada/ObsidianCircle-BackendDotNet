# Probar bloqueo pesimista (race condition) en desarrollo

Objetivo: simular dos peticiones concurrentes que intentan reservar el mismo recurso (misma sala, fecha y franja) y comprobar que una recibe **201** y la otra **409 Conflict**.

---

## Requisitos

- API en marcha: `dotnet run` en `src/MiProyecto.WebApi` (p. ej. https://localhost:7200).
- Al menos una sala existente en la base de datos (GameRoom con un Id válido).
- Un usuario de prueba (para obtener un token).

---

## Opción 1: Prueba manual con dos ventanas del navegador

1. Abre la app en **dos ventanas** (una normal y otra en **modo incógnito** o otro navegador).
2. Inicia sesión con **dos usuarios distintos** (ej. xavi y valeria).
3. En ambas ventanas:
   - Ve a **Tienda / Salas** y entra en la **misma sala**.
   - Elige la **misma fecha** y la **misma franja** (ej. Mañana).
4. En las dos ventanas, haz clic en **"Confirmar reserva"** casi a la vez (con poco margen).
5. Resultado esperado:
   - Una ventana: mensaje de éxito y redirección al dashboard.
   - La otra: toast **"No se pudo completar la reserva"** con **"El recurso ya no está disponible..."** y la lista de reservas del día se actualiza (refetch).

---

## Opción 2: Script PowerShell (dos peticiones concurrentes)

El script hace login, obtiene un token y lanza **dos POST** simultáneos a `/api/reservations` con la misma sala, fecha y franja. Uno debe devolver 201 y el otro 409.

1. Obtén un **GameRoomId** (GUID de una sala):
   - **Desde la app**: Abre DevTools (F12) → pestaña Network → entra en una sala; en la petición a `GameRooms` o al cargar la página de reserva verás el `id` de la sala en la respuesta.
   - **Desde Postgres**: `docker exec -it postgres_ludoteca psql -U postgres -d LudotecaDb -c 'SELECT "Id", "Name" FROM "GameRooms" LIMIT 3;'`

2. Ejecuta el script (sustituye email, password, gameRoomId y fecha):
   ```powershell
   .\scripts\test-reservation-race.ps1 -Email "xavi@gmail.com" -Password "tucontraseña" -GameRoomId "GUID-DE-LA-SALA" -Date "2026-03-20"
   ```

El script imprime el resultado de cada petición (código y cuerpo). Debes ver un **201** y un **409**.

---

## Opción 3: Una sola sesión, dos clics rápidos

1. Un solo usuario en una pestaña.
2. Misma sala, misma fecha, misma franja.
3. Haz doble clic muy rápido en **"Confirmar reserva"** (o abre DevTools → Network y dispara dos veces el submit).
4. La primera petición puede devolver 201; la segunda debe devolver **409** y mostrarse el toast de "recurso no disponible" y refresco de la lista.

---

## Comprobar en la base de datos

Después de una prueba exitosa, en Postgres no debe haber dos reservas activas para la misma sala/fecha/franja:

```sql
\c LudotecaDb
SELECT r."Id", r."GameRoomId", r."Date", r."Franja", r."UserId"
FROM reservations r
WHERE r."Estado" = 0
ORDER BY r."Date", r."GameRoomId";
```

Para una misma combinación de `GameRoomId`, `Date` y franja solo debe aparecer **una** reserva activa.
