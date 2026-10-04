import type { GameSortValue } from "../../api";
import { handleSortControlKeydown } from "./handle-sort-control-keydown";
import { createSortControlListbox } from "./create-sort-control-listbox";
import { createSortControlTrigger } from "./create-sort-control-trigger";
import { defaultSortOption, sortOptions } from "./sort-options";

interface SortControl {
  element: HTMLDivElement;
  setValue: (sort: GameSortValue) => void;
  destroy: () => void;
}

export const createSortControl = (
  onChange: (sort: GameSortValue) => void,
): SortControl => {
  const container: HTMLDivElement = document.createElement("div");
  container.className = "library-controls__sort";

  const trigger = createSortControlTrigger();
  const listbox = createSortControlListbox((sortOption): void => {
    onChange(sortOption.value);
    closeListbox();
    trigger.element.focus();
  });

  const handleOutsideClick = (event: MouseEvent): void => {
    if (!container.contains(event.target as Node)) {
      closeListbox();
    }
  };

  const closeListbox = (): void => {
    listbox.element.hidden = true;
    trigger.setExpanded(false);
    document.removeEventListener("click", handleOutsideClick);
  };

  const openListbox = (): void => {
    listbox.element.hidden = false;
    trigger.setExpanded(true);
    document.addEventListener("click", handleOutsideClick);
    listbox.options
      .find(
        (option): boolean => option.getAttribute("aria-selected") === "true",
      )
      ?.focus();
  };

  const setValue = (sort: GameSortValue): void => {
    const selectedOption =
      sortOptions.find((option) => option.value === sort) ?? defaultSortOption;
    trigger.setLabel(selectedOption.label);
    listbox.setSelected(selectedOption.value);
  };

  setValue(defaultSortOption.value);
  trigger.setExpanded(false);

  trigger.element.addEventListener("click", (): void => {
    if (listbox.element.hidden) {
      openListbox();
    } else {
      closeListbox();
    }
  });

  trigger.element.addEventListener("keydown", (event: KeyboardEvent): void => {
    if (!["ArrowDown", "Enter", " "].includes(event.key)) {
      return;
    }

    event.preventDefault();
    openListbox();
  });

  listbox.element.addEventListener("keydown", (event: KeyboardEvent): void => {
    handleSortControlKeydown(
      event,
      listbox.options,
      closeListbox,
      trigger.element,
    );
  });

  container.append(trigger.element, listbox.element);
  return { element: container, setValue, destroy: closeListbox };
};
