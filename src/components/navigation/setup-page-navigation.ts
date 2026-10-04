import type { AppPage } from "../../types/app-page";
import { getPagePath } from "../../router";

export const setupPageNavigation = (
  link: HTMLAnchorElement,
  page: AppPage,
  navigateTo: (page: AppPage) => void,
): void => {
  link.href = getPagePath(page);
  link.addEventListener("click", (event: MouseEvent): void => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigateTo(page);
  });
};
