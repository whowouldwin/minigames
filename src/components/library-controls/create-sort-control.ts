import type { GameSortValue } from "../../api";
import { handleSortControlKeydown } from "./handle-sort-control-keydown";
import { createSortControlListbox } from "./create-sort-control-listbox";
import { createSortControlTrigger } from "./create-sort-control-trigger";
import { defaultSortOption } from "./sort-options";

export const createSortControl = (
  onChange: (sort: GameSortValue) => void,
): HTMLDivElement => {
  const container: HTMLDivElement = document.createElement("div");
  container.className = "library-controls__sort";

  const trigger = createSortControlTrigger();
  const listbox = createSortControlListbox((sortOption): void => {
    trigger.setLabel(sortOption.label);
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

  trigger.setLabel(defaultSortOption.label);
  listbox.setSelected(defaultSortOption.value);

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
  return container;
};
