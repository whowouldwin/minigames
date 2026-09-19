import { navigationItems } from "./navigation-items";

export const createNavigationList = (blockName: string): HTMLUListElement => {
  const list: HTMLUListElement = document.createElement("ul");

  list.className = `${blockName}__list`;

  for (const { label, href } of navigationItems) {
    const item: HTMLLIElement = document.createElement("li");
    const link: HTMLAnchorElement = document.createElement("a");

    link.className = `${blockName}__link`;
    link.href = href;
    link.textContent = label;

    if (label === "Home") {
      link.classList.add(`${blockName}__link--active`);
      link.setAttribute("aria-current", "page");
    }

    item.append(link);
    list.append(item);
  }

  return list;
};
