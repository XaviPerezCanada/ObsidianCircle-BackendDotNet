-- Añade la columna Slug a la tabla reservations (migración AddReservationSlug).
-- Ejecutar en psql conectado a LudotecaDb:
--   \c LudotecaDb
--   \i scripts/add-reservations-slug.sql
-- O desde la raíz del proyecto:
--   psql -h localhost -p 5432 -U postgres -d LudotecaDb -f scripts/add-reservations-slug.sql

-- 1. Añadir columna (nullable primero)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS "Slug" character varying(32);

-- 2. Rellenar slugs existentes: Id sin guiones
UPDATE reservations SET "Slug" = REPLACE("Id"::text, '-', '') WHERE "Slug" IS NULL;

-- 3. Hacer la columna obligatoria
ALTER TABLE reservations ALTER COLUMN "Slug" SET NOT NULL;

-- 4. Índice único para búsqueda por slug
CREATE UNIQUE INDEX IF NOT EXISTS "IX_reservations_Slug" ON reservations ("Slug");
