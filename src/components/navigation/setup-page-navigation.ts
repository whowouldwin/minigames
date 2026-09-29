import type { AppPage } from "../../types/app-page";

export const setupPageNavigation = (
  link: HTMLAnchorElement,
  page: AppPage,
  navigateTo: (page: AppPage) => void,
): void => {
  link.addEventListener("click", (event: MouseEvent): void => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    navigateTo(page);
  });
};
