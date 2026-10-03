import type { GameSortValue } from "../../api";
import { defaultSortOption, sortOptions } from "./sort-options";
import type { SortOption } from "./sort-options";
import sortArrowDown from "../../assets/icons/sort-arrow-down.svg";
import sortArrowUp from "../../assets/icons/sort-arrow-up.svg";
import sortOptionCheck from "../../assets/icons/sort-option-check.svg";

const updateOptionStates = (
  options: HTMLButtonElement[],
  selected: GameSortValue,
): void => {
  for (const option of options) {
    option.setAttribute(
      "aria-selected",
      String(option.dataset.sortValue === selected),
    );
  }
};

export const createSortControl = (
  onChange: (sort: GameSortValue) => void,
): HTMLDivElement => {
  const container: HTMLDivElement = document.createElement("div");
  container.className = "library-controls__sort";

  const trigger: HTMLButtonElement = document.createElement("button");
  trigger.className = "library-controls__sort-trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "library-sort-options");

  const selectedLabel: HTMLSpanElement = document.createElement("span");
  selectedLabel.className = "library-controls__sort-label";

  const arrow: HTMLImageElement = document.createElement("img");
  arrow.className = "library-controls__sort-arrow";
  arrow.alt = "";
  arrow.setAttribute("aria-hidden", "true");

  trigger.append(selectedLabel, arrow);

  const listbox: HTMLDivElement = document.createElement("div");
  listbox.className = "library-controls__sort-options";
  listbox.id = "library-sort-options";
  listbox.setAttribute("role", "listbox");
  listbox.setAttribute("aria-label", "Sort games");
  listbox.hidden = true;

  const options: HTMLButtonElement[] = sortOptions.map(
    (sortOption: SortOption) => {
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

      const optionLabel: HTMLSpanElement = document.createElement("span");
      optionLabel.textContent = sortOption.label;

      option.append(check, optionLabel);

      option.addEventListener("click", (): void => {
        selectedLabel.textContent = `Sort by: ${sortOption.label}`;
        updateOptionStates(options, sortOption.value);
        onChange(sortOption.value);
        closeListbox();
        trigger.focus();
      });

      listbox.append(option);
      return option;
    },
  );

  const handleOutsideClick = (event: MouseEvent): void => {
    if (!container.contains(event.target as Node)) {
      closeListbox();
    }
  };

  const closeListbox = (): void => {
    listbox.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    updateArrow();
    document.removeEventListener("click", handleOutsideClick);
  };

  const updateArrow = (): void => {
    arrow.src = listbox.hidden ? sortArrowDown : sortArrowUp;
  };

  const openListbox = (): void => {
    listbox.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    updateArrow();
    document.addEventListener("click", handleOutsideClick);
    options
      .find(
        (option: HTMLButtonElement) =>
          option.getAttribute("aria-selected") === "true",
      )
      ?.focus();
  };

  selectedLabel.textContent = `Sort by: ${defaultSortOption.label}`;
  updateOptionStates(options, defaultSortOption.value);
  updateArrow();

  trigger.addEventListener("click", (): void => {
    if (listbox.hidden) {
      openListbox();
    } else {
      closeListbox();
    }
  });

  trigger.addEventListener("keydown", (event: KeyboardEvent): void => {
    if (!["ArrowDown", "Enter", " "].includes(event.key)) {
      return;
    }

    event.preventDefault();
    openListbox();
  });

  listbox.addEventListener("keydown", (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      closeListbox();
      trigger.focus();
      return;
    }

    const currentIndex: number = options.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    let nextIndex: number;

    switch (event.key) {
      case "ArrowDown": {
        nextIndex = Math.min(currentIndex + 1, options.length - 1);
        break;
      }
      case "ArrowUp": {
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      }
      case "Home": {
        nextIndex = 0;
        break;
      }
      case "End": {
        nextIndex = options.length - 1;
        break;
      }
      default: {
        return;
      }
    }

    event.preventDefault();
    options[nextIndex]?.focus();
  });

  container.append(trigger, listbox);
  return container;
};
