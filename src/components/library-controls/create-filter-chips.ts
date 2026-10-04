import type { GameCategory, GameCategorySlug } from "../../api";

interface FilterChips {
  elements: HTMLButtonElement[];
  setSelected: (category: GameCategorySlug) => void;
}

export const createFilterChips = (
  categories: GameCategory[],
  initialCategory: GameCategorySlug,
  onChange: (category: GameCategorySlug) => void,
): FilterChips => {
  const chips: HTMLButtonElement[] = [];
  let selectedCategory = initialCategory;

  const setSelected = (selected: GameCategorySlug): void => {
    selectedCategory = selected;
    for (const chip of chips) {
      chip.setAttribute(
        "aria-pressed",
        String(chip.dataset.category === selected),
      );
    }
  };

  for (const category of categories) {
    const chip: HTMLButtonElement = document.createElement("button");
    chip.className = "library-controls__filter";
    chip.type = "button";
    chip.dataset.category = category.slug;
    chip.textContent = category.label;
    chip.setAttribute(
      "aria-pressed",
      String(category.slug === selectedCategory),
    );

    chip.addEventListener("click", (): void => {
      if (selectedCategory === category.slug) return;

      onChange(category.slug);
    });

    chips.push(chip);
  }

  return { elements: chips, setSelected };
};
