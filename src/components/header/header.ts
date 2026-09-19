import { createSiteLogo } from "../ui/site-logo";
import { createButton } from "../ui/button";
import { createMainNavigation } from "../navigation/main-navigation";
import { createMenuToggle } from "../ui/menu-toggle";

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

  actions.append(createMainNavigation(), buttons, createMenuToggle());

  header.append(createSiteLogo(), actions);

  return header;
};
