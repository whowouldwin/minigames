import { createNavigationList } from "../create-navigation-list";

import "./main-navigation.scss";

export const createMainNavigation = (): HTMLElement => {
  const navigation: HTMLElement = document.createElement("nav");

  navigation.className = "main-navigation";
  navigation.setAttribute("aria-label", "Main navigation");

  navigation.append(createNavigationList("main-navigation"));

  return navigation;
};
