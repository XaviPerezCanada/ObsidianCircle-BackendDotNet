import { useState } from "react";
import { useDebouncedValue } from "./useDebounceValue";

export function useSearch(initial = '') {
  const [query, setQuery] = useState(initial);
  const debouncedQuery = useDebouncedValue(query, 300);

  return {
    query,
    setQuery,
    debouncedQuery,
    resetSearch: () => setQuery(''),
  };
}