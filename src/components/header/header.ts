import { createMainNavigation } from "../navigation/main-navigation";
import { createButton } from "../ui/button";
import { createMenuToggle } from "../ui/menu-toggle";
import { createSiteLogo } from "../ui/site-logo";
import { createMobileMenu, setupMobileMenu } from "../mobile-menu";

import type { AuthMode } from "../auth-dialog";
import type { AppPage } from "../../types/app-page";

import "./header.scss";

export const createHeader = (
  openAuth: (mode: AuthMode) => void,
  activePage: AppPage,
  navigateTo: (page: AppPage) => void,
): HTMLElement => {
  const header: HTMLElement = document.createElement("header");

  header.className = "header";

  const actions: HTMLDivElement = document.createElement("div");
  actions.className = "header__actions";

  const buttons: HTMLDivElement = document.createElement("div");
  buttons.className = "header__buttons";

  const loginButton: HTMLButtonElement = createButton("Log In", "outlined");
  const signupButton: HTMLButtonElement = createButton("Sign Up", "filled");

  loginButton.classList.add("header__login-button");
  signupButton.classList.add("header__signup-button");

  loginButton.addEventListener("click", (): void => {
    openAuth("login");
  });
  signupButton.addEventListener("click", (): void => {
    openAuth("register");
  });
  buttons.append(loginButton, signupButton);

  const menuToggle: HTMLButtonElement = createMenuToggle();

  actions.append(
    createMainNavigation(activePage, navigateTo),
    buttons,
    menuToggle,
  );

  const mobileMenu: HTMLElement = createMobileMenu(activePage, navigateTo);

  setupMobileMenu(menuToggle, mobileMenu, openAuth);

  header.append(createSiteLogo(navigateTo), actions, mobileMenu);

  return header;
};
