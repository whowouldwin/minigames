export interface PaginationPageWindow {
  firstPage: number;
  lastPage: number;
}

export const getVisiblePageWindow = (
  currentPage: number,
  totalPages: number,
  visiblePageLimit: number,
): PaginationPageWindow => {
  const visiblePageCount = Math.min(visiblePageLimit, totalPages);
  const lastPossibleFirstPage = totalPages - visiblePageCount + 1;
  const firstPage = Math.max(
    1,
    Math.min(
      currentPage - Math.floor(visiblePageCount / 2),
      lastPossibleFirstPage,
    ),
  );

  return {
    firstPage,
    lastPage: firstPage + visiblePageCount - 1,
  };
};
