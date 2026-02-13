import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  gameRoomService,
  type GameRoomSearchParams,
  type PagedResult,
  type GameRoom,
} from "@/src/services/sala.service";
import { useSearch } from "./useSearch";
import { usePager } from "./usePage";
import { useFilters } from "./useFilters";
import { buildQueryFromParams } from "@/src/utils/BuildQuery";

export type GameRoomSearchFilters = {
  /** Capacidad mínima (número de personas) */
  capacity?: number;
  /** Orden: nombre_asc, nombre_desc */
  sort?: string;
};

export type UseGameRoomSearchOptions = {
  /** Número de salas por página (por defecto 10). El backend admite hasta 50. */
  pageSize?: number;
  /** Sincronizar filtros con la URL (ej. /shop/rooms?q=sala&capacity=4&sort=nombre_asc) */
  syncWithUrl?: boolean;
};

const INITIAL_FILTERS = { capacity: "", sort: "" } as const;

function getInitialFromUrl(searchParams: URLSearchParams) {
  return {
    q: searchParams.get("q") ?? "",
    capacity: searchParams.get("capacity") ?? "",
    sort: searchParams.get("sort") ?? "",
    page: Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
  };
}

export function useGameRoomSearch(
  _initialFilters: GameRoomSearchFilters = {},
  options: UseGameRoomSearchOptions = {}
) {
  const { pageSize = 10, syncWithUrl = true } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<PagedResult<GameRoom> | null>(null);
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
    syncWithUrl ? { capacity: fromUrl.capacity, sort: fromUrl.sort } : INITIAL_FILTERS
  );

  // Sincronizar URL -> estado cuando la URL cambia
  useEffect(() => {
    if (!syncWithUrl) return;
    const url = getInitialFromUrl(searchParams);
    setQuery(url.q);
    setFilterRaw("capacity", url.capacity);
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
      capacity:
        filterParams.capacity !== undefined &&
        filterParams.capacity !== "" &&
        Number(filterParams.capacity) > 0
          ? filterParams.capacity
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
  }, [debouncedQuery, filterParams.capacity, filterParams.sort, page, syncWithUrl]);

  const searchQueryParams = useMemo((): GameRoomSearchParams => {
    const params: GameRoomSearchParams = {
      page,
      limit: size,
    };
    if (debouncedQuery?.trim()) params.q = debouncedQuery.trim();
    if (filterParams.capacity !== undefined && filterParams.capacity !== "") {
      const n = Number(filterParams.capacity);
      if (!Number.isNaN(n) && n > 0) params.capacity = n;
    }
    if (
      filterParams.sort !== undefined &&
      filterParams.sort !== "" &&
      filterParams.sort !== "__default__"
    )
      params.sort = filterParams.sort;
    return params;
  }, [debouncedQuery, filterParams, page, size]);

  const search = useCallback(
    async (searchParams?: Partial<GameRoomSearchParams>) => {
      try {
        setLoading(true);
        setError(null);
        const params: GameRoomSearchParams = searchParams ?? searchQueryParams;
        const result = await gameRoomService.search(params);
        setResults(result);
        return result;
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { message?: string; detail?: string } } })?.response?.data
            ?.message ||
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          "Error al buscar salas";
        setError(errorMessage);
        setResults(null);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [searchQueryParams]
  );

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, filterParams.capacity, filterParams.sort, page, size]);

  useEffect(() => {
    resetToFirstPage();
  }, [debouncedQuery, filterParams.capacity, filterParams.sort]);

  const setFilter = useCallback(
    (key: keyof GameRoomSearchFilters, value: number | string | undefined) => {
      setFilterRaw(key, value === undefined ? "" : String(value));
    },
    [setFilterRaw]
  );

  const clearFilters = useCallback(() => {
    clearFiltersRaw();
    setQuery("");
  }, [clearFiltersRaw, setQuery]);

  const resetFilters = useCallback(() => {
    clearFiltersRaw();
  }, [clearFiltersRaw]);

  const filters: GameRoomSearchFilters = useMemo(
    () => ({
      capacity:
        filterParams.capacity !== undefined && filterParams.capacity !== ""
          ? Number(filterParams.capacity)
          : undefined,
      sort:
        filterParams.sort !== undefined &&
        filterParams.sort !== "" &&
        filterParams.sort !== "__default__"
          ? filterParams.sort
          : undefined,
    }),
    [filterParams]
  );

  return {
    gameRooms: results?.items ?? [],
    totalCount: results?.totalCount ?? 0,
    page: results?.page ?? page,
    pageSize: results?.pageSize ?? size,
    totalPages: results ? Math.ceil(results.totalCount / results.pageSize) : 0,

    loading,
    error,

    query,
    setQuery,
    debouncedQuery,

    filters,
    setFilter,
    clearFilters,
    resetFilters,

    setPage,
    setSize: (newSize: number) => {
      setSize(newSize);
      resetToFirstPage();
    },
    nextPage,
    prevPage,
    resetToFirstPage,

    searchQueryParams,

    search,
    refetch: () => search(),
  };
}
