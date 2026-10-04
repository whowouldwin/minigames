import paginationChevronBackward from "../../assets/icons/pagination-chevron-backward.svg";
import paginationChevronForward from "../../assets/icons/pagination-chevron-forward.svg";

type PaginationDirection = "previous" | "next";

export const createPaginationArrowButton = (
  direction: PaginationDirection,
): HTMLButtonElement => {
  const button = document.createElement("button");
  button.className = `library-pagination__arrow library-pagination__arrow--${direction}`;
  button.type = "button";
  button.setAttribute(
    "aria-label",
    direction === "previous" ? "Previous page" : "Next page",
  );

  const icon = document.createElement("img");
  icon.alt = "";
  icon.src =
    direction === "previous"
      ? paginationChevronBackward
      : paginationChevronForward;
  button.append(icon);

  return button;
};
