import { useRef } from "react";
import { useGameRoomSearch } from "@/src/hooks/useGameRoomSearch";
import GameRoomSearchFilters from "./components/game-room-search-filters";
import CardGameRooms from "./components/cardGameRooms";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";

const ROOMS_PER_PAGE = 4;

export default function ShopRoom() {
  const {
    gameRooms,
    loading,
    error,
    totalCount,
    page,
    totalPages,
    nextPage,
    prevPage,
    ...filterState
  } = useGameRoomSearch({}, { pageSize: ROOMS_PER_PAGE });

  const listSectionRef = useRef<HTMLElement | null>(null);

  const scrollToList = () => {
    if (!listSectionRef.current) return;
    const rect = listSectionRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const offset = 80;
    window.scrollTo({
      top: rect.top + scrollTop - offset,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <GameRoomSearchFilters
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
          Cargando salas...
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-destructive">Error: {error}</div>
      )}

      {!loading && !error && (
        <section className="space-y-4" ref={listSectionRef}>
          <h2 className="text-xl font-semibold mb-4">
            Salas {totalCount > 0 && `(${totalCount})`}
          </h2>
          <CardGameRooms
            gameRooms={gameRooms}
            loading={loading}
            error={error}
          />

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      prevPage();
                      scrollToList();
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
                      scrollToList();
                    }}
                    aria-disabled={page >= totalPages}
                    className={
                      page >= totalPages ? "pointer-events-none opacity-50" : ""
                    }
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
