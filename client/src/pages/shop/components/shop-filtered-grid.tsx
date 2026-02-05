import { useJuegoSearch } from "@/src/hooks/useJuegoSearch";
import JuegoSearchFilters from "./juego-search-filters";
import CardCarousel from "./card-carousel";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";

/** Número de cartas por página (el backend admite hasta 50). */
const CARDS_PER_PAGE = 12;

/**
 * Componente que combina filtros de búsqueda y grid de cartas de juegos.
 * Usa los mismos filtros para pintar el CardCarousel (sin el carrusel destacado de CarrouselList).
 */
export default function ShopFilteredGrid() {
  const {
    juegos,
    loading,
    error,
    totalCount,
    page,
    totalPages,
    nextPage,
    prevPage,
    setPage,
    ...filterState
  } = useJuegoSearch({}, { pageSize: CARDS_PER_PAGE });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      <JuegoSearchFilters
        query={filterState.query}
        setQuery={filterState.setQuery}
        filters={filterState.filters}
        setFilter={filterState.setFilter}
        clearFilters={filterState.clearFilters}
        loading={loading}
        totalCount={totalCount}
      />

      {loading && (
        <div className="py-12 text-center text-muted-foreground">
          Cargando juegos...
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-destructive">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Juegos {totalCount > 0 && `(${totalCount})`}
          </h2>
          <CardCarousel juegos={juegos} />

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      prevPage();
                    }}
                    aria-disabled={page <= 1}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      nextPage(totalPages);
                    }}
                    aria-disabled={page >= totalPages}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </section>
      )}
    </div>
  );
}
