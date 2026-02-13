/**
 * Mapeo de nombres/slugs de salas a sus imágenes locales.
 * Las imágenes deben estar en /public/images/GameRooms/
 */
const ROOM_IMAGE_MAP: Record<string, string> = {
  // Por nombre (case-insensitive, sin espacios)
  camarote: "/images/GameRooms/Camarote.png",
  cripta: "/images/GameRooms/Cripta.png",
  principal: "/images/GameRooms/Principal.png",
  // Por slug (si difiere del nombre)
  // Ejemplo: "sala-camarote": "/images/GameRooms/Camarote.png",
};

/**
 * Normaliza un texto para búsqueda: lowercase, sin espacios, sin acentos
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/\s+/g, "") // Eliminar espacios
    .replace(/[^a-z0-9]/g, ""); // Solo letras y números
}

/**
 * Devuelve una URL de imagen para una sala.
 * Primero intenta encontrar la imagen por nombre/slug, luego usa capacidad como fallback.
 * 
 * @param name Nombre de la sala (ej: "Camarote", "Cripta")
 * @param slug Slug de la sala (ej: "camarote", "cripta")
 * @param capacity Capacidad de la sala (número de personas) - usado como fallback
 * @returns URL de imagen local o placeholder por capacidad
 */
export function getGameRoomImageUrl(
  name: string,
  slug: string,
  capacity: number
): string {
  // Normalizar nombre y slug para búsqueda
  const normalizedName = normalizeText(name);
  const normalizedSlug = normalizeText(slug);

  // Debug: log temporal para ver qué valores llegan
  console.log(`[getGameRoomImageUrl] name: "${name}", slug: "${slug}", normalizedName: "${normalizedName}", normalizedSlug: "${normalizedSlug}"`);

  // Buscar por nombre normalizado
  const nameMatch = Object.keys(ROOM_IMAGE_MAP).find(
    (key) => normalizeText(key) === normalizedName
  );
  if (nameMatch) {
    console.log(`[getGameRoomImageUrl] Match encontrado por nombre: ${ROOM_IMAGE_MAP[nameMatch]}`);
    return ROOM_IMAGE_MAP[nameMatch];
  }

  // Buscar por slug normalizado
  const slugMatch = Object.keys(ROOM_IMAGE_MAP).find(
    (key) => normalizeText(key) === normalizedSlug
  );
  if (slugMatch) {
    console.log(`[getGameRoomImageUrl] Match encontrado por slug: ${ROOM_IMAGE_MAP[slugMatch]}`);
    return ROOM_IMAGE_MAP[slugMatch];
  }

  // Buscar por coincidencia parcial (por si el nombre contiene "Camarote" o "Cripta")
  const partialMatch = Object.keys(ROOM_IMAGE_MAP).find(
    (key) =>
      normalizedName.includes(normalizeText(key)) ||
      normalizedSlug.includes(normalizeText(key)) ||
      normalizeText(key).includes(normalizedName) ||
      normalizeText(key).includes(normalizedSlug)
  );
  if (partialMatch) {
    console.log(`[getGameRoomImageUrl] Match parcial encontrado: ${ROOM_IMAGE_MAP[partialMatch]}`);
    return ROOM_IMAGE_MAP[partialMatch];
  }

  // Fallback: usar placeholder por capacidad si no hay imagen específica
  const fallbackUrl = getGameRoomImageUrlByCapacity(capacity);
  console.log(`[getGameRoomImageUrl] Usando fallback por capacidad: ${fallbackUrl}`);
  return fallbackUrl;
}

/**
 * Devuelve una URL de placeholder basada en la capacidad (fallback).
 * 
 * @param capacity Capacidad de la sala (número de personas)
 * @returns URL de placeholder
 */
function getGameRoomImageUrlByCapacity(capacity: number): string {
  const colors = [
    "6366f1", // indigo para 2-4
    "8b5cf6", // purple para 5-6
    "ec4899", // pink para 7-8
    "f59e0b", // amber para 9-10
    "10b981", // emerald para 11+
  ];

  let colorIndex = 0;
  if (capacity <= 4) colorIndex = 0;
  else if (capacity <= 6) colorIndex = 1;
  else if (capacity <= 8) colorIndex = 2;
  else if (capacity <= 10) colorIndex = 3;
  else colorIndex = 4;

  return `https://via.placeholder.com/800x600/${colors[colorIndex]}/ffffff?text=Sala+${capacity}+personas`;
}

/**
 * Versión alternativa usando Unsplash Source (requiere conexión a internet)
 * Descomenta esta función y comenta la anterior si prefieres imágenes reales
 */
export function getGameRoomImageUrlUnsplash(capacity: number): string {
  const keywords = [
    "board+game+table",
    "gaming+room",
    "board+game+cafe",
    "tabletop+gaming",
    "board+game+space",
  ];
  
  const keyword = keywords[capacity % keywords.length];
  return `https://source.unsplash.com/800x600/?${keyword}`;
}
