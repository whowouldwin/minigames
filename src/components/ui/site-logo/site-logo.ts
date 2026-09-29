import logoMarkUrl from "../../../assets/icons/logo-mark.png";
import type { AppPage } from "../../../types/app-page";
import { setupPageNavigation } from "../../navigation/setup-page-navigation";
import "./site-logo.scss";

export const createSiteLogo = (
  navigateTo?: (page: AppPage) => void,
): HTMLAnchorElement => {
  const link: HTMLAnchorElement = document.createElement("a");
  link.className = "site-logo";
  link.href = "./";
  if (navigateTo) {
    setupPageNavigation(link, "home", navigateTo);
  }

  const icon: HTMLImageElement = document.createElement("img");
  icon.className = "site-logo__icon";
  icon.src = logoMarkUrl;
  icon.alt = "logo";

  const text: HTMLSpanElement = document.createElement("span");
  text.className = "site-logo__text";
  text.textContent = "MiniGames";
  link.append(icon, text);

  return link;
};
