import type { GameSummary } from "../../api";
import { createLibraryGameCard } from "../library-game-card";
import { toLibraryGame } from "./game-card-data";

export const showLibraryGameListState = (
  list: HTMLUListElement,
  content: HTMLElement,
): void => {
  const item: HTMLLIElement = document.createElement("li");
  item.className = "library-game-list__state";
  item.append(content);
  list.replaceChildren(item);
};

export const renderLibraryGames = (
  list: HTMLUListElement,
  games: GameSummary[],
  openDetails: () => void,
): void => {
  list.replaceChildren();

  for (const [index, game] of games.entries()) {
    const item: HTMLLIElement = document.createElement("li");
    item.className = "library-game-list__item";
    item.append(
      createLibraryGameCard(toLibraryGame(game), index + 1, openDetails),
    );
    list.append(item);
  }
};
