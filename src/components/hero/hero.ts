import { createButton } from "../ui/button";

import "./hero.scss";

export const createHero = (): HTMLElement => {
  const hero: HTMLElement = document.createElement("section");
  hero.className = "hero";

  const content: HTMLDivElement = document.createElement("div");
  content.className = "hero__content";

  const title: HTMLHeadingElement = document.createElement("h1");
  title.className = "hero__title";
  title.textContent = "Take a Short Break & Have Fun";

  const description: HTMLParagraphElement = document.createElement("p");
  description.className = "hero__description";

  const desktopDescription: HTMLSpanElement = document.createElement("span");
  desktopDescription.className = "hero__description-desktop";
  desktopDescription.textContent =
    "Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle, match 3, farm, and board classics.";

  const mobileDescription: HTMLSpanElement = document.createElement("span");
  mobileDescription.className = "hero__description-mobile";
  mobileDescription.textContent =
    "Discover hundreds of curated casual mini-games right in your browser.";

  description.append(desktopDescription, mobileDescription);

  const browseButton: HTMLButtonElement = createButton(
    "Browse Library",
    "filled",
    "large",
  );
  browseButton.classList.add("hero__button");

  content.append(title, description, browseButton);
  hero.append(content);

  return hero;
};
