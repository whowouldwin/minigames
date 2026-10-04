import sortOptionCheck from "../../assets/icons/sort-option-check.svg";
import type { SortOption } from "./sort-options";

export const createSortControlOption = (
  sortOption: SortOption,
): HTMLButtonElement => {
  const option: HTMLButtonElement = document.createElement("button");
  option.className = "library-controls__sort-option";
  option.type = "button";
  option.setAttribute("role", "option");
  option.dataset.sortValue = sortOption.value;

  const check: HTMLImageElement = document.createElement("img");
  check.className = "library-controls__sort-check";
  check.src = sortOptionCheck;
  check.alt = "";
  check.setAttribute("aria-hidden", "true");

  const label: HTMLSpanElement = document.createElement("span");
  label.textContent = sortOption.label;

  option.append(check, label);
  return option;
};
