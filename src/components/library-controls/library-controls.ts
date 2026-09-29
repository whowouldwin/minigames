import "./library-controls.scss";
import { createFilterChips } from "./create-filter-chips";
import { createSortControl } from "./create-sort-control";

export const createLibraryControls = (): HTMLElement => {
  const section: HTMLElement = document.createElement("section");
  section.className = "library-controls";
  section.setAttribute("aria-label", "Filter and sort games");

  section.append(createFilterChips(), createSortControl());
  return section;
};
