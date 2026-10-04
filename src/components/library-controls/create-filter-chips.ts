import type { GameCategory, GameCategorySlug } from "../../api";

export const createFilterChips = (
  categories: GameCategory[],
  defaultCategory: GameCategorySlug,
  onChange: (category: GameCategorySlug) => void,
): HTMLButtonElement[] => {
  const chips: HTMLButtonElement[] = [];
  let selectedCategory = defaultCategory;

  for (const category of categories) {
    const chip: HTMLButtonElement = document.createElement("button");
    chip.className = "library-controls__filter";
    chip.type = "button";
    chip.textContent = category.label;
    chip.setAttribute(
      "aria-pressed",
      String(category.slug === selectedCategory),
    );

    chip.addEventListener("click", (): void => {
      if (selectedCategory === category.slug) return;

      selectedCategory = category.slug;
      for (const filter of chips) {
        filter.setAttribute("aria-pressed", String(filter === chip));
      }

      onChange(selectedCategory);
    });

    chips.push(chip);
  }

  return chips;
};
