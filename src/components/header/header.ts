import { createMainNavigation } from "../navigation/main-navigation";
import { createButton } from "../ui/button";
import { createMenuToggle } from "../ui/menu-toggle";
import { createSiteLogo } from "../ui/site-logo";
import { createMobileMenu, setupMobileMenu } from "../mobile-menu";

import type { AuthMode } from "../auth-dialog";
import type { AppSession } from "../../auth";
import type { AppPage } from "../../types/app-page";
import { createProfileIdentity } from "./profile-identity";

import "./header.scss";

export interface HeaderController {
  element: HTMLElement;
  setAuthenticated: (session: AppSession) => void;
  setGuest: () => void;
}

export const createHeader = (
  openAuth: (mode: AuthMode) => void,
  activePage: AppPage | undefined,
  navigateTo: (page: AppPage) => void,
  onLogout: () => void,
): HeaderController => {
  const header: HTMLElement = document.createElement("header");

  header.className = "header";

  const actions: HTMLDivElement = document.createElement("div");
  actions.className = "header__actions";

  const buttons: HTMLDivElement = document.createElement("div");
  buttons.className = "header__buttons";

  const loginButton: HTMLButtonElement = createButton("Log In", "outlined");
  const signupButton: HTMLButtonElement = createButton("Sign Up", "filled");
  const logoutButton: HTMLButtonElement = createButton("Log Out", "outlined");

  loginButton.classList.add("header__login-button");
  signupButton.classList.add("header__signup-button");
  logoutButton.classList.add("header__logout-button");

  loginButton.addEventListener("click", (): void => {
    openAuth("login");
  });
  signupButton.addEventListener("click", (): void => {
    openAuth("register");
  });
  logoutButton.addEventListener("click", onLogout);
  buttons.append(loginButton, signupButton);

  const menuToggle: HTMLButtonElement = createMenuToggle();

  actions.append(
    createMainNavigation(activePage, navigateTo),
    buttons,
    menuToggle,
  );

  const mobileMenu: HTMLElement = createMobileMenu(activePage, navigateTo);
  const mobileMenuLogoutButton = mobileMenu.querySelector<HTMLButtonElement>(
    ".mobile-menu__logout-button",
  );
  const mobileMenuActions = mobileMenu.querySelector<HTMLElement>(
    ".mobile-menu__actions",
  );
  const mobileMenuLoginButton = mobileMenu.querySelector<HTMLButtonElement>(
    ".mobile-menu__login-button",
  );
  const mobileMenuSignupButton = mobileMenu.querySelector<HTMLButtonElement>(
    ".mobile-menu__signup-button",
  );

  setupMobileMenu(menuToggle, mobileMenu, openAuth, onLogout);

  header.append(createSiteLogo(navigateTo), actions, mobileMenu);

  return {
    element: header,
    setAuthenticated: (session: AppSession): void => {
      logoutButton.hidden = false;
      buttons.replaceChildren(
        createProfileIdentity(session, "header__account profile-identity"),
        logoutButton,
      );
      if (mobileMenuLogoutButton) mobileMenuLogoutButton.hidden = false;
      mobileMenuActions?.replaceChildren(
        createProfileIdentity(session, "mobile-menu__account profile-identity"),
        ...(mobileMenuLogoutButton ? [mobileMenuLogoutButton] : []),
      );
    },
    setGuest: (): void => {
      logoutButton.hidden = true;
      if (mobileMenuLogoutButton) mobileMenuLogoutButton.hidden = true;
      buttons.replaceChildren(loginButton, signupButton);
      if (mobileMenuLoginButton && mobileMenuSignupButton) {
        mobileMenuActions?.replaceChildren(
          mobileMenuLoginButton,
          mobileMenuSignupButton,
        );
      }
    },
  };
};
