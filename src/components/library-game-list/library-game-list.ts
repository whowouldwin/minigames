import { createLibraryGameCard } from "../library-game-card";
import { libraryGames } from "./library-games";

import "./library-game-list.scss";

export const createLibraryGameList = (openDetails: () => void): HTMLElement => {
  const section: HTMLElement = document.createElement("section");
  section.className = "library-game-list";
  section.setAttribute("aria-label", "Games");

  const list: HTMLUListElement = document.createElement("ul");
  list.className = "library-game-list__items";

  for (const [index, game] of libraryGames.entries()) {
    const item: HTMLLIElement = document.createElement("li");
    item.className = "library-game-list__item";
    item.append(createLibraryGameCard(game, index + 1, openDetails));
    list.append(item);
  }

  section.append(list);

  return section;
};
