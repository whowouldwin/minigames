import paginationChevronBackward from "../../assets/icons/pagination-chevron-backward.svg";
import paginationChevronForward from "../../assets/icons/pagination-chevron-forward.svg";

import "./library-pagination.scss";

const TOTAL_PAGES: number = 10;
const PAGE_LIMIT_PROPERTY: string = "--library-pagination-page-limit";

const getVisiblePageLimit = (element: HTMLElement): number => {
  const pageLimitValue: string = globalThis
    .getComputedStyle(element)
    .getPropertyValue(PAGE_LIMIT_PROPERTY)
    .trim();
  const pageLimit: number = Number(pageLimitValue);

  return !pageLimitValue || Number.isNaN(pageLimit)
    ? TOTAL_PAGES
    : Math.min(TOTAL_PAGES, Math.max(1, pageLimit));
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

export const createLibraryPagination = (): HTMLElement => {
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

  const pageItems: HTMLLIElement[] = [];
  const pageButtons: HTMLButtonElement[] = [];

  for (let page = 1; page <= TOTAL_PAGES; page += 1) {
    const item: HTMLLIElement = document.createElement("li");
    item.className = "library-pagination__item";

    const button: HTMLButtonElement = document.createElement("button");
    button.className = "library-pagination__page";
    button.type = "button";
    button.textContent = String(page);
    button.setAttribute("aria-label", `Page ${page}`);

    button.addEventListener("click", (): void => {
      activePage = page;
      updateControls();
    });

    item.append(button);
    pageItems.push(item);
    pageButtons.push(button);
  }

  const nextItem: HTMLLIElement = document.createElement("li");
  const nextButton: HTMLButtonElement = createArrowButton("next");
  nextItem.append(nextButton);

  let activePage: number = 1;
  let visiblePageLimit: number = getVisiblePageLimit(section);

  const updateControls = (): void => {
    const firstVisiblePage: number = Math.max(
      1,
      Math.min(
        activePage - Math.floor(visiblePageLimit / 2),
        TOTAL_PAGES - visiblePageLimit + 1,
      ),
    );
    const lastVisiblePage: number = Math.min(
      TOTAL_PAGES,
      firstVisiblePage + visiblePageLimit - 1,
    );

    for (const [index, button] of pageButtons.entries()) {
      const page: number = index + 1;
      const item: HTMLLIElement = pageItems[index];

      item.hidden = page < firstVisiblePage || page > lastVisiblePage;

      button.toggleAttribute("aria-current", page === activePage);

      if (page === activePage) {
        button.setAttribute("aria-current", "page");
      }
    }

    previousButton.disabled = activePage === 1;
    nextButton.disabled = activePage === TOTAL_PAGES;
  };

  previousButton.addEventListener("click", (): void => {
    if (activePage === 1) {
      return;
    }

    activePage -= 1;
    updateControls();
  });

  nextButton.addEventListener("click", (): void => {
    if (activePage === TOTAL_PAGES) {
      return;
    }

    activePage += 1;
    updateControls();
  });

  list.append(previousItem, ...pageItems, nextItem);
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

  return section;
};
