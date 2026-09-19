import { createNavigationList } from "../navigation/create-navigation-list";
import { createButton } from "../ui/button";
import { createSiteLogo } from "../ui/site-logo";

import "./mobile-menu.scss";

export const createMobileMenu = (): HTMLElement => {
  const menu: HTMLElement = document.createElement("div");

  menu.className = "mobile-menu";
  menu.setAttribute("aria-hidden", "true");

  const top: HTMLDivElement = document.createElement("div");
  top.className = "mobile-menu__top";

  const logo: HTMLAnchorElement = createSiteLogo();
  logo.classList.add("mobile-menu__logo");

  top.append(logo);

  const navigation: HTMLElement = document.createElement("nav");

  navigation.className = "mobile-menu__navigation";
  navigation.setAttribute("aria-label", "Mobile navigation");

  navigation.append(createNavigationList("mobile-menu"));

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
