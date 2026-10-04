import { createPaginationArrowButton } from "./create-pagination-arrow-button";
import { createPaginationPageItem } from "./create-pagination-page-item";
import { getVisiblePageWindow } from "./pagination-page-window";

import "./library-pagination.scss";

const DEFAULT_VISIBLE_PAGE_LIMIT = 4;
const VISIBLE_PAGE_LIMIT_PROPERTY = "--library-pagination-page-limit";

interface LibraryPaginationController {
  element: HTMLElement;
  update: (page: number, totalPages: number) => void;
}

const getVisiblePageLimit = (element: HTMLElement): number => {
  const value = globalThis
    .getComputedStyle(element)
    .getPropertyValue(VISIBLE_PAGE_LIMIT_PROPERTY)
    .trim();
  const pageLimit = Number(value);
  const hasValidPageLimit =
    value !== "" && Number.isFinite(pageLimit) && pageLimit >= 1;

  return hasValidPageLimit ? Math.floor(pageLimit) : DEFAULT_VISIBLE_PAGE_LIMIT;
};

export const createLibraryPagination = (
  onPageChange: (page: number) => void,
): LibraryPaginationController => {
  const section = document.createElement("section");
  section.className = "library-pagination";

  const navigation = document.createElement("nav");
  navigation.className = "library-pagination__navigation";
  navigation.setAttribute("aria-label", "Library pages");

  const list = document.createElement("ul");
  list.className = "library-pagination__controls";

  const previousItem = document.createElement("li");
  const previousButton = createPaginationArrowButton("previous");
  previousItem.append(previousButton);

  const nextItem = document.createElement("li");
  const nextButton = createPaginationArrowButton("next");
  nextItem.append(nextButton);

  let currentPage = 1;
  let totalPages = 1;
  let visiblePageLimit = getVisiblePageLimit(section);

  const renderControls = (): void => {
    const pageWindow = getVisiblePageWindow(
      currentPage,
      totalPages,
      visiblePageLimit,
    );
    const pageItems: HTMLLIElement[] = [];

    for (
      let page = pageWindow.firstPage;
      page <= pageWindow.lastPage;
      page += 1
    ) {
      const item = createPaginationPageItem(page, currentPage, onPageChange);
      pageItems.push(item);
    }

    previousButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    list.replaceChildren(previousItem, ...pageItems, nextItem);
  };

  const update = (page: number, pages: number): void => {
    totalPages = Number.isFinite(pages) ? Math.max(1, Math.floor(pages)) : 1;
    currentPage = Number.isFinite(page)
      ? Math.min(totalPages, Math.max(1, Math.floor(page)))
      : 1;
    renderControls();
  };

  const requestPageChange = (page: number): void => {
    if (page < 1 || page > totalPages) {
      return;
    }

    onPageChange(page);
  };

  previousButton.addEventListener("click", (): void => {
    requestPageChange(currentPage - 1);
  });

  nextButton.addEventListener("click", (): void => {
    requestPageChange(currentPage + 1);
  });

  navigation.append(list);
  section.append(navigation);

  const updateVisiblePageLimit = (): void => {
    if (!section.isConnected) {
      resizeObserver.disconnect();
      return;
    }

    const nextLimit = getVisiblePageLimit(section);

    if (nextLimit === visiblePageLimit) {
      return;
    }

    visiblePageLimit = nextLimit;
    renderControls();
  };

  const resizeObserver = new ResizeObserver(updateVisiblePageLimit);
  resizeObserver.observe(section);

  renderControls();

  return { element: section, update };
};
