export const createPaginationPageItem = (
  page: number,
  currentPage: number,
  onPageChange: (page: number) => void,
): HTMLLIElement => {
  const item = document.createElement("li");
  item.className = "library-pagination__item";

  const button = document.createElement("button");
  button.className = "library-pagination__page";
  button.type = "button";
  button.textContent = String(page);
  button.setAttribute("aria-label", `Page ${page}`);

  if (page === currentPage) {
    button.setAttribute("aria-current", "page");
  }

  button.addEventListener("click", (): void => onPageChange(page));
  item.append(button);

  return item;
};
