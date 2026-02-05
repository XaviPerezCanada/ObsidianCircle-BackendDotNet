import { useState } from "react";

export function useFilters<T extends Record<string, string>>(initial: T) {
  const [filters, setFilters] = useState(initial);

  const setFilter = (key: keyof T, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initial);
  };

  const filterParams = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== "" && v !== undefined && v !== null
    )
  ) as Partial<T>;

  return {
    filters,
    setFilters,
    setFilter,
    filterParams,
    clearFilters,
    resetFilters: () => setFilters(initial),
  };
}   