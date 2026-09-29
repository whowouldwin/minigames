import type { AppPage } from "../../types/app-page";
import { setupPageNavigation } from "./setup-page-navigation";
import { navigationItems } from "./navigation-items";

export const createNavigationList = (
  blockName: string,
  activePage: AppPage,
  navigateTo: (page: AppPage) => void,
): HTMLUListElement => {
  const list: HTMLUListElement = document.createElement("ul");

  list.className = `${blockName}__list`;

  for (const {
    label,
    href,
    targetPage,
    activePage: navigationPage,
  } of navigationItems) {
    const item: HTMLLIElement = document.createElement("li");
    const link: HTMLAnchorElement = document.createElement("a");

    link.className = `${blockName}__link`;
    link.href = href;
    link.textContent = label;
    link.dataset.navigationBlock = blockName;
    if (navigationPage) link.dataset.page = navigationPage;

    if (navigationPage === activePage) {
      link.classList.add(`${blockName}__link--active`);
      link.setAttribute("aria-current", "page");
    }

    setupPageNavigation(link, targetPage, navigateTo);

    item.append(link);
    list.append(item);
  }

  return list;
};

export const updateNavigationState = (
  root: ParentNode,
  activePage: AppPage,
): void => {
  for (const link of root.querySelectorAll<HTMLAnchorElement>("a[data-page]")) {
    const blockName: string | undefined = link.dataset.navigationBlock;

    if (!blockName) continue;

    const isActive: boolean = link.dataset.page === activePage;

    link.classList.toggle(`${blockName}__link--active`, isActive);
    link.toggleAttribute("aria-current", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
  }
};
