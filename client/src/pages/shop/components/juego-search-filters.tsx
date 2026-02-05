import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Search, X } from "lucide-react";
import { useJuegoSearch } from "@/src/hooks/useJuegoSearch";
import type { JuegoSearchFilters as JuegoSearchFiltersType } from "@/src/hooks/useJuegoSearch";

export type JuegoSearchFiltersProps = {
  query: string;
  setQuery: (value: string) => void;
  filters: JuegoSearchFiltersType;
  setFilter: (key: keyof JuegoSearchFiltersType, value: number | string | undefined) => void;
  clearFilters: () => void;
  loading: boolean;
  totalCount: number;
};

export default function JuegoSearchFilters({
  query,
  setQuery,
  filters,
  setFilter,
  clearFilters,
  loading,
  totalCount,
}: JuegoSearchFiltersProps) {

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar juegos por título, género, editorial..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={clearFilters}
          disabled={!query && !filters.jugadores && !filters.sort}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jugadores">Número de jugadores</Label>
          <Input
            id="jugadores"
            type="number"
            min="1"
            placeholder="Ej: 4"
            value={filters.jugadores || ""}
            onChange={(e) => {
              const value = e.target.value;
              setFilter("jugadores", value ? parseInt(value) : undefined);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort">Ordenar por</Label>
          <Select
            value={filters.sort ?? "__default__"}
            onValueChange={(value) => setFilter("sort", value === "__default__" ? undefined : value)}
          >
            <SelectTrigger id="sort">
              <SelectValue placeholder="Seleccionar orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__default__">Por defecto</SelectItem>
              <SelectItem value="titulo_asc">Título A-Z</SelectItem>
              <SelectItem value="titulo_desc">Título Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Buscando...</p>
      )}

      {!loading && totalCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? "juego encontrado" : "juegos encontrados"}
        </p>
      )}
    </div>
  );
}

/** Versión con hook interno, para usar los filtros solos (sin grid). */
export function JuegoSearchFiltersWithHook() {
  const state = useJuegoSearch();
  return (
    <JuegoSearchFilters
      query={state.query}
      setQuery={state.setQuery}
      filters={state.filters}
      setFilter={state.setFilter}
      clearFilters={state.clearFilters}
      loading={state.loading}
      totalCount={state.totalCount}
    />
  );
}
