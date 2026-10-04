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
  let pageItems: HTMLLIElement[] = [];

  const renderPageButtons = (): void => {
    for (const item of pageItems) {
      item.remove();
    }

    pageItems = [];

    const pageWindow = getVisiblePageWindow(
      currentPage,
      totalPages,
      visiblePageLimit,
    );

    for (
      let page = pageWindow.firstPage;
      page <= pageWindow.lastPage;
      page += 1
    ) {
      const item = createPaginationPageItem(page, currentPage, onPageChange);
      pageItems.push(item);
      nextItem.before(item);
    }
  };

  const updateArrowButtons = (): void => {
    previousButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
  };

  const renderControls = (): void => {
    renderPageButtons();
    updateArrowButtons();
  };

  const update = (page: number, pages: number): void => {
    totalPages = Number.isFinite(pages) ? Math.max(1, Math.floor(pages)) : 1;
    currentPage = Number.isFinite(page)
      ? Math.min(totalPages, Math.max(1, Math.floor(page)))
      : 1;
    renderControls();
  };

  previousButton.addEventListener("click", (): void => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  });

  nextButton.addEventListener("click", (): void => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  });

  list.append(previousItem, nextItem);
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
    renderPageButtons();
  };

  const resizeObserver = new ResizeObserver(updateVisiblePageLimit);
  resizeObserver.observe(section);

  renderControls();

  return { element: section, update };
};
