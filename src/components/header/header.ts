import { createMainNavigation } from "../navigation/main-navigation";
import { createMobileMenu } from "../mobile-menu";
import { createButton } from "../ui/button";
import { createMenuToggle } from "../ui/menu-toggle";
import { createSiteLogo } from "../ui/site-logo";

import "./header.scss";

export const createHeader = (): HTMLElement => {
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

  buttons.append(loginButton, signupButton);

  const menuToggle: HTMLButtonElement = createMenuToggle();

  actions.append(createMainNavigation(), buttons, menuToggle);

  const mobileMenu: HTMLElement = createMobileMenu();

  menuToggle.addEventListener("click", () => {
    const isOpen: boolean = mobileMenu.classList.toggle("mobile-menu--open");

    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  header.append(createSiteLogo(), actions, mobileMenu);

  return header;
};
