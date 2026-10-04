import paginationChevronBackward from "../../assets/icons/pagination-chevron-backward.svg";
import paginationChevronForward from "../../assets/icons/pagination-chevron-forward.svg";

import "./library-pagination.scss";

const DEFAULT_PAGE_LIMIT: number = 4;
const PAGE_LIMIT_PROPERTY: string = "--library-pagination-page-limit";

interface LibraryPaginationController {
  element: HTMLElement;
  update: (page: number, totalPages: number) => void;
}

const getVisiblePageLimit = (element: HTMLElement): number => {
  const value: string = globalThis
    .getComputedStyle(element)
    .getPropertyValue(PAGE_LIMIT_PROPERTY)
    .trim();
  const pageLimit: number = Number(value);

  return value && Number.isFinite(pageLimit) && pageLimit >= 1
    ? Math.floor(pageLimit)
    : DEFAULT_PAGE_LIMIT;
};

const createArrowButton = (
  direction: "previous" | "next",
): HTMLButtonElement => {
  const button: HTMLButtonElement = document.createElement("button");
  button.className = `library-pagination__arrow library-pagination__arrow--${direction}`;
  button.type = "button";
  button.setAttribute(
    "aria-label",
    direction === "previous" ? "Previous page" : "Next page",
  );

  const icon: HTMLImageElement = document.createElement("img");
  icon.alt = "";
  icon.src =
    direction === "previous"
      ? paginationChevronBackward
      : paginationChevronForward;
  button.append(icon);

  return button;
};

const createPageButton = (
  page: number,
  activePage: number,
  onPageChange: (page: number) => void,
): HTMLLIElement => {
  const item: HTMLLIElement = document.createElement("li");
  item.className = "library-pagination__item";

  const button: HTMLButtonElement = document.createElement("button");
  button.className = "library-pagination__page";
  button.type = "button";
  button.textContent = String(page);
  button.setAttribute("aria-label", `Page ${page}`);

  if (page === activePage) {
    button.setAttribute("aria-current", "page");
  }

  button.addEventListener("click", (): void => onPageChange(page));

  item.append(button);
  return item;
};

export const createLibraryPagination = (
  onPageChange: (page: number) => void,
): LibraryPaginationController => {
  const section: HTMLElement = document.createElement("section");
  section.className = "library-pagination";

  const navigation: HTMLElement = document.createElement("nav");
  navigation.className = "library-pagination__navigation";
  navigation.setAttribute("aria-label", "Library pages");

  const list: HTMLUListElement = document.createElement("ul");
  list.className = "library-pagination__controls";

  const previousItem: HTMLLIElement = document.createElement("li");
  const previousButton: HTMLButtonElement = createArrowButton("previous");
  previousItem.append(previousButton);

  const nextItem: HTMLLIElement = document.createElement("li");
  const nextButton: HTMLButtonElement = createArrowButton("next");
  nextItem.append(nextButton);

  let activePage: number = 1;
  let totalPages: number = 1;
  let visiblePageLimit: number = getVisiblePageLimit(section);
  let pageItems: HTMLLIElement[] = [];

  const updateControls = (): void => {
    const visiblePageCount: number = Math.min(visiblePageLimit, totalPages);
    const firstVisiblePage: number = Math.max(
      1,
      Math.min(
        activePage - Math.floor(visiblePageCount / 2),
        totalPages - visiblePageCount + 1,
      ),
    );
    const lastVisiblePage: number = firstVisiblePage + visiblePageCount - 1;

    for (const item of pageItems) {
      item.remove();
    }

    pageItems = [];

    for (
      let page: number = firstVisiblePage;
      page <= lastVisiblePage;
      page += 1
    ) {
      const item: HTMLLIElement = createPageButton(
        page,
        activePage,
        onPageChange,
      );
      pageItems.push(item);
      nextItem.before(item);
    }

    previousButton.disabled = activePage === 1;
    nextButton.disabled = activePage === totalPages;
  };

  const update = (page: number, pages: number): void => {
    totalPages = Number.isFinite(pages) ? Math.max(1, Math.floor(pages)) : 1;
    activePage = Number.isFinite(page)
      ? Math.min(totalPages, Math.max(1, Math.floor(page)))
      : 1;
    updateControls();
  };

  previousButton.addEventListener("click", (): void => {
    if (activePage > 1) {
      onPageChange(activePage - 1);
    }
  });

  nextButton.addEventListener("click", (): void => {
    if (activePage < totalPages) {
      onPageChange(activePage + 1);
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

    const nextLimit: number = getVisiblePageLimit(section);

    if (nextLimit === visiblePageLimit) {
      return;
    }

    visiblePageLimit = nextLimit;
    updateControls();
  };

  const resizeObserver: ResizeObserver = new ResizeObserver(
    updateVisiblePageLimit,
  );
  resizeObserver.observe(section);

  updateControls();

  return { element: section, update };
};
