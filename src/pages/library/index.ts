import "./library-page.scss";
import { createLibraryControls } from "../../components/library-controls";
import { createLibraryGameList } from "../../components/library-game-list";

export const createLibraryPage = (openGameDetails: () => void): HTMLElement => {
  const main: HTMLElement = document.createElement("main");
  main.className = "library-page";

  const section: HTMLElement = document.createElement("section");
  section.className = "library-page__intro";

  const heading: HTMLHeadingElement = document.createElement("h1");
  heading.textContent = "Game Library";

  const description: HTMLParagraphElement = document.createElement("p");
  description.textContent = "Browse our collection of casual mini-games";

  section.append(heading, description);
  main.append(
    section,
    createLibraryControls(),
    createLibraryGameList(openGameDetails),
  );

  return main;
};
