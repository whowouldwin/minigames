import type { AppPage } from "../../types/app-page";
import { createNavigationList } from "../navigation/create-navigation-list";
import { createButton } from "../ui/button";
import { createMenuToggle } from "../ui/menu-toggle";
import { createSiteLogo } from "../ui/site-logo";

import "./mobile-menu.scss";

export const createMobileMenu = (
  activePage: AppPage,
  navigateTo: (page: AppPage) => void,
): HTMLElement => {
  const menu: HTMLElement = document.createElement("div");

  menu.className = "mobile-menu";
  menu.setAttribute("aria-hidden", "true");

  const top: HTMLDivElement = document.createElement("div");
  top.className = "mobile-menu__top";

  const logo: HTMLAnchorElement = createSiteLogo(navigateTo);
  logo.classList.add("mobile-menu__logo");

  const closeButton: HTMLButtonElement = createMenuToggle();
  closeButton.classList.add("mobile-menu__close");
  closeButton.setAttribute("aria-label", "Close menu");
  closeButton.removeAttribute("aria-expanded");
  top.append(logo, closeButton);

  const navigation: HTMLElement = document.createElement("nav");

  navigation.className = "mobile-menu__navigation";
  navigation.setAttribute("aria-label", "Mobile navigation");

  navigation.append(
    createNavigationList("mobile-menu", activePage, navigateTo),
  );

  const actions: HTMLDivElement = document.createElement("div");
  actions.className = "mobile-menu__actions";

  const loginButton: HTMLButtonElement = createButton("Log In", "outlined");
  const signupButton: HTMLButtonElement = createButton("Sign Up", "filled");

  loginButton.classList.add("mobile-menu__login-button");
  signupButton.classList.add("mobile-menu__signup-button");

  actions.append(loginButton, signupButton);

  menu.append(top, navigation, actions);

  return menu;
};
