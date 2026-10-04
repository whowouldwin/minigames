import type { GameSortValue } from "../../api";
import { createSortControlOption } from "./create-sort-control-option";
import { sortOptions } from "./sort-options";
import type { SortOption } from "./sort-options";

export interface SortControlListbox {
  element: HTMLDivElement;
  options: HTMLButtonElement[];
  setSelected: (selected: GameSortValue) => void;
}

export const createSortControlListbox = (
  onSelect: (option: SortOption) => void,
): SortControlListbox => {
  const element: HTMLDivElement = document.createElement("div");
  element.className = "library-controls__sort-options";
  element.id = "library-sort-options";
  element.setAttribute("role", "listbox");
  element.setAttribute("aria-label", "Sort games");
  element.hidden = true;

  const options: HTMLButtonElement[] = [];
  const setSelected = (selected: GameSortValue): void => {
    for (const option of options) {
      option.setAttribute(
        "aria-selected",
        String(option.dataset.sortValue === selected),
      );
    }
  };

  for (const sortOption of sortOptions) {
    const option = createSortControlOption(sortOption);
    option.addEventListener("click", (): void => {
      setSelected(sortOption.value);
      onSelect(sortOption);
    });

    options.push(option);
    element.append(option);
  }

  return { element, options, setSelected };
};
