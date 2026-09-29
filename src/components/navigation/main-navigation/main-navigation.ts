import type { AppPage } from "../../../types/app-page";
import { createNavigationList } from "../create-navigation-list";

import "./main-navigation.scss";

export const createMainNavigation = (
  activePage: AppPage,
  navigateTo: (page: AppPage) => void,
): HTMLElement => {
  const navigation: HTMLElement = document.createElement("nav");

  navigation.className = "main-navigation";
  navigation.setAttribute("aria-label", "Main navigation");

  navigation.append(
    createNavigationList("main-navigation", activePage, navigateTo),
  );

  return navigation;
};
