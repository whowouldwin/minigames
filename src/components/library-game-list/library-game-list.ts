import { appAssetUrl, getErrorMessage, getLibraryGames } from "../../api";
import type { GameSummary } from "../../api";
import { createLibraryGameCard } from "../library-game-card";
import type { LibraryGame } from "../library-game-card";
import {
  createEmptyState,
  createErrorState,
  createRequestSkeleton,
} from "../ui/request-feedback";
import type { SnackbarController } from "../ui/snackbar";

import "./library-game-list.scss";

const formatCompactCount = (count: number): string =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);

const toLibraryGame = (game: GameSummary): LibraryGame => ({
  title: game.name,
  category: game.category.slice(0, 1).toUpperCase() + game.category.slice(1),
  price: game.price,
  description: game.shortDescription,
  rating: game.rating.toFixed(1),
  likes: formatCompactCount(game.likesCount),
  image: appAssetUrl(game.cardImage),
});

export const createLibraryGameList = (
  openDetails: () => void,
  snackbar: SnackbarController,
): HTMLElement => {
  const section: HTMLElement = document.createElement("section");
  section.className = "library-game-list";
  section.setAttribute("aria-label", "Games");

  const list: HTMLUListElement = document.createElement("ul");
  list.className = "library-game-list__items";

  section.append(list);

  const showState = (content: HTMLElement): void => {
    const item: HTMLLIElement = document.createElement("li");
    item.className = "library-game-list__state";
    item.append(content);
    list.replaceChildren(item);
  };

  const loadGames = async (): Promise<void> => {
    showState(createRequestSkeleton("Loading library games", "game-list", 6));

    try {
      const response = await getLibraryGames();
      if (!section.isConnected) return;

      if (response.data.length === 0) {
        showState(createEmptyState("No games are available yet."));
        return;
      }

      list.replaceChildren();
      let index = 0;

      for (const game of response.data) {
        const item: HTMLLIElement = document.createElement("li");
        item.className = "library-game-list__item";
        item.append(
          createLibraryGameCard(toLibraryGame(game), index + 1, openDetails),
        );
        list.append(item);
        index += 1;
      }
    } catch (error) {
      if (!section.isConnected) return;

      const message = getErrorMessage(
        error,
        "The library games could not be loaded.",
      );
      snackbar.show("The library games could not be loaded.", "error");
      showState(createErrorState(message, (): void => void loadGames()));
    }
  };

  void loadGames();

  return section;
};
