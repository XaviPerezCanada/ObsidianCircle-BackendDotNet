import { useCallback, useState } from "react";

export function usePager({ initialPage = 1, initialSize = 10 } = {}) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  const nextPage = useCallback((totalPages: number) => {
    setPage(p => Math.min(p + 1, totalPages ?? p + 1));
  }, []);

  const prevPage = useCallback(() => {
    setPage(p => Math.max(1, p - 1));
  }, []);

  const resetToFirstPage = () => setPage(1);

  return { page, size, setPage, setSize, nextPage, prevPage, resetToFirstPage };
}