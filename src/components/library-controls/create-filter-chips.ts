import { filterCategories } from "./filter-categories";

export const createFilterChips = (): HTMLDivElement => {
  const group: HTMLDivElement = document.createElement("div");
  group.className = "library-controls__filters";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Filter games by category");

  for (const [index, category] of filterCategories.entries()) {
    const chip: HTMLButtonElement = document.createElement("button");
    chip.className = "library-controls__filter";
    chip.type = "button";
    chip.textContent = category;
    chip.setAttribute("aria-pressed", String(index === 0));

    chip.addEventListener("click", (): void => {
      for (const filter of group.querySelectorAll<HTMLButtonElement>(
        ".library-controls__filter",
      )) {
        filter.setAttribute("aria-pressed", String(filter === chip));
      }
    });

    group.append(chip);
  }

  return group;
};
