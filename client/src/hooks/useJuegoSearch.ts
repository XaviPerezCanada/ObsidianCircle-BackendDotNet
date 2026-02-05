import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { juegoService, type BoardGameSearchParams, type PagedResult, type Juego } from "@/src/services/juego.service";
import { useSearch } from "./useSearch";
import { usePager } from "./usePage";
import { useFilters } from "./useFilters";
import { buildQueryFromParams } from "@/src/utils/BuildQuery";

export type JuegoSearchFilters = {
  /** Número de jugadores: filtrar juegos que admitan al menos este número */
  jugadores?: number;
  /** Orden: titulo_asc, titulo_desc */
  sort?: string;
};

export type UseJuegoSearchOptions = {
  /** Número de cartas/juegos por página (por defecto 12). El backend admite hasta 50. */
  pageSize?: number;
  /** Sincronizar filtros con la URL (ej. /shop?q=catan&jugadores=4&sort=titulo_asc) */
  syncWithUrl?: boolean;
};

const INITIAL_FILTERS = { jugadores: "", sort: "" } as const;

function getInitialFromUrl(searchParams: URLSearchParams) {
  return {
    q: searchParams.get("q") ?? "",
    jugadores: searchParams.get("jugadores") ?? "",
    sort: searchParams.get("sort") ?? "",
    page: Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
  };
}

export function useJuegoSearch(
  _initialFilters: JuegoSearchFilters = {},
  options: UseJuegoSearchOptions = {}
) {
  const { pageSize = 4, syncWithUrl = true } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<PagedResult<Juego> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSyncingFromUrl = useRef(false);

  const fromUrl = useMemo(() => getInitialFromUrl(searchParams), []);
  const { query, setQuery, debouncedQuery } = useSearch(syncWithUrl ? fromUrl.q : "");
  const { page, size, setPage, setSize, nextPage, prevPage, resetToFirstPage } = usePager({
    initialPage: syncWithUrl ? fromUrl.page : 1,
    initialSize: pageSize,
  });
  const { setFilter: setFilterRaw, filterParams, clearFilters: clearFiltersRaw } = useFilters(
    syncWithUrl ? { jugadores: fromUrl.jugadores, sort: fromUrl.sort } : INITIAL_FILTERS
  );

  // Sincronizar URL -> estado cuando la URL cambia (p. ej. atrás/adelante o enlace directo)
  useEffect(() => {
    if (!syncWithUrl) return;
    const url = getInitialFromUrl(searchParams);
    setQuery(url.q);
    setFilterRaw("jugadores", url.jugadores);
    setFilterRaw("sort", url.sort);
    setPage(url.page);
    isSyncingFromUrl.current = true;
  }, [searchParams, syncWithUrl]);

  // Sincronizar estado -> URL cuando cambian filtros, búsqueda o página
  useEffect(() => {
    if (!syncWithUrl || isSyncingFromUrl.current) {
      isSyncingFromUrl.current = false;
      return;
    }
    const nextStr = buildQueryFromParams({
      q: debouncedQuery?.trim() || undefined,
      jugadores:
        filterParams.jugadores !== undefined &&
        filterParams.jugadores !== "" &&
        Number(filterParams.jugadores) > 0
          ? filterParams.jugadores
          : undefined,
      sort:
        filterParams.sort !== undefined &&
        filterParams.sort !== "" &&
        filterParams.sort !== "__default__"
          ? filterParams.sort
          : undefined,
      page: page > 1 ? page : undefined,
    });
    const next = new URLSearchParams(nextStr);
    if (nextStr !== searchParams.toString()) setSearchParams(next, { replace: true });
  }, [debouncedQuery, filterParams.jugadores, filterParams.sort, page, syncWithUrl]);

  // Query del buscador construida solo con los parámetros elegidos (sin vacíos)
  const searchQueryParams = useMemo((): BoardGameSearchParams => {
    const params: BoardGameSearchParams = {
      page,
      limit: size,
    };
    if (debouncedQuery?.trim()) params.q = debouncedQuery.trim();
    if (filterParams.jugadores !== undefined && filterParams.jugadores !== "") {
      const n = Number(filterParams.jugadores);
      if (!Number.isNaN(n) && n > 0) params.jugadores = n;
    }
    if (filterParams.sort !== undefined && filterParams.sort !== "" && filterParams.sort !== "__default__")
      params.sort = filterParams.sort;
    return params;
  }, [debouncedQuery, filterParams, page, size]);

  const search = useCallback(async (searchParams?: Partial<BoardGameSearchParams>) => {
    try {
      setLoading(true);
      setError(null);
      const params: BoardGameSearchParams = searchParams ?? searchQueryParams;
      const result = await juegoService.search(params);
      setResults(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || 'Error al buscar juegos';
      setError(errorMessage);
      setResults(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [searchQueryParams]);

  // Búsqueda automática cuando cambia la query construida o la página
  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, filterParams.jugadores, filterParams.sort, page, size]);

  // Resetear a primera página cuando cambian filtros o búsqueda
  useEffect(() => {
    resetToFirstPage();
  }, [debouncedQuery, filterParams.jugadores, filterParams.sort]);

  const setFilter = useCallback((key: keyof JuegoSearchFilters, value: number | string | undefined) => {
    setFilterRaw(key, value === undefined ? "" : String(value));
  }, [setFilterRaw]);

  const clearFilters = useCallback(() => {
    clearFiltersRaw();
    setQuery("");
  }, [clearFiltersRaw, setQuery]);

  const resetFilters = useCallback(() => {
    clearFiltersRaw();
  }, [clearFiltersRaw]);

  // Objeto filtros para la UI (jugadores como number cuando existe)
  const filters: JuegoSearchFilters = useMemo(() => ({
    jugadores: filterParams.jugadores !== undefined && filterParams.jugadores !== "" ? Number(filterParams.jugadores) : undefined,
    sort: filterParams.sort !== undefined && filterParams.sort !== "" && filterParams.sort !== "__default__" ? filterParams.sort : undefined,
  }), [filterParams]);

  return {
    // Resultados
    juegos: results?.items ?? [],
    totalCount: results?.totalCount ?? 0,
    page: results?.page ?? page,
    pageSize: results?.pageSize ?? size,
    totalPages: results ? Math.ceil(results.totalCount / results.pageSize) : 0,

    // Estado
    loading,
    error,

    // Búsqueda
    query,
    setQuery,
    debouncedQuery,

    // Filtros
    filters,
    setFilter,
    clearFilters,
    resetFilters,

    // Paginación (page y pageSize ya están en Resultados)
    setPage,
    setSize: (newSize: number) => {
      setSize(newSize);
      resetToFirstPage();
    },
    nextPage,
    prevPage,
    resetToFirstPage,

    // Query construida (solo parámetros con valor, para API o UI)
    searchQueryParams,

    // Acciones
    search,
    refetch: () => search(),
  };
}
