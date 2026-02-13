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
import { useGameRoomSearch } from "@/src/hooks/useGameRoomSearch";
import type { GameRoomSearchFilters as GameRoomSearchFiltersType } from "@/src/hooks/useGameRoomSearch";

export type GameRoomSearchFiltersProps = {
  query: string;
  setQuery: (value: string) => void;
  filters: GameRoomSearchFiltersType;
  setFilter: (
    key: keyof GameRoomSearchFiltersType,
    value: number | string | undefined
  ) => void;
  clearFilters: () => void;
  loading: boolean;
  totalCount: number;
};

export default function GameRoomSearchFilters({
  query,
  setQuery,
  filters,
  setFilter,
  clearFilters,
  loading,
  totalCount,
}: GameRoomSearchFiltersProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar salas por nombre, descripción..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={clearFilters}
          disabled={!query && !filters.capacity && !filters.sort}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacidad mínima (personas o más)</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            placeholder="Ej: 4"
            value={filters.capacity ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setFilter("capacity", value ? parseInt(value, 10) : undefined);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort">Ordenar por</Label>
          <Select
            value={filters.sort ?? "__default__"}
            onValueChange={(value) =>
              setFilter("sort", value === "__default__" ? undefined : value)
            }
          >
            <SelectTrigger id="sort">
              <SelectValue placeholder="Seleccionar orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__default__">Por defecto</SelectItem>
              <SelectItem value="nombre_asc">Nombre A-Z</SelectItem>
              <SelectItem value="nombre_desc">Nombre Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Buscando...</p>
      )}

      {!loading && totalCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {totalCount}{" "}
          {totalCount === 1 ? "sala encontrada" : "salas encontradas"}
        </p>
      )}
    </div>
  );
}

/** Versión con hook interno, para usar los filtros solos (sin grid). */
export function GameRoomSearchFiltersWithHook() {
  const state = useGameRoomSearch();
  return (
    <GameRoomSearchFilters
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
