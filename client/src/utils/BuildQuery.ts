/**
 * Construye una query string a partir de un objeto.
 * Solo incluye parámetros con valor (no undefined, null ni string vacío).
 */
export function buildQueryFromParams(
  params: Record<string, string | number | undefined | null>
): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

/**
 * Construye query para artículos (article slug + filters + page + size).
 */
export function buildQuery(article: any, filters: any, page: any, size: any) {
  const query = new URLSearchParams();

  if (article) query.set("article", article.slug);
  if (page) query.set("page", page);
  if (size) query.set("size", size);

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value) {
      query.set(key, value as string);
    }
  });

  return query.toString();
}   