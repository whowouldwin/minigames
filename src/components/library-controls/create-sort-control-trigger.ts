import sortArrowDown from "../../assets/icons/sort-arrow-down.svg";
import sortArrowUp from "../../assets/icons/sort-arrow-up.svg";

export interface SortControlTrigger {
  element: HTMLButtonElement;
  setLabel: (label: string) => void;
  setExpanded: (isExpanded: boolean) => void;
}

export const createSortControlTrigger = (): SortControlTrigger => {
  const element: HTMLButtonElement = document.createElement("button");
  element.className = "library-controls__sort-trigger";
  element.type = "button";
  element.setAttribute("aria-haspopup", "listbox");
  element.setAttribute("aria-expanded", "false");
  element.setAttribute("aria-controls", "library-sort-options");

  const label: HTMLSpanElement = document.createElement("span");
  label.className = "library-controls__sort-label";

  const arrow: HTMLImageElement = document.createElement("img");
  arrow.className = "library-controls__sort-arrow";
  arrow.alt = "";
  arrow.setAttribute("aria-hidden", "true");

  element.append(label, arrow);

  return {
    element,
    setLabel: (text: string): void => {
      label.textContent = `Sort by: ${text}`;
    },
    setExpanded: (isExpanded: boolean): void => {
      element.setAttribute("aria-expanded", String(isExpanded));
      arrow.src = isExpanded ? sortArrowUp : sortArrowDown;
    },
  };
};
