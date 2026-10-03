import { getErrorMessage, getLibraryGames } from "../../api";
import {
  createEmptyState,
  createErrorState,
  createRequestSkeleton,
} from "../ui/request-feedback";
import type { SnackbarController } from "../ui/snackbar";
import {
  renderLibraryGames,
  showLibraryGameListState,
} from "./render-library-game-list";

import "./library-game-list.scss";

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

  const loadGames = async (): Promise<void> => {
    showLibraryGameListState(
      list,
      createRequestSkeleton("Loading library games", "game-list", 6),
    );

    try {
      const response = await getLibraryGames();
      if (!section.isConnected) return;

      if (response.data.length === 0) {
        showLibraryGameListState(
          list,
          createEmptyState("No games are available yet."),
        );
        return;
      }

      renderLibraryGames(list, response.data, openDetails);
    } catch (error) {
      if (!section.isConnected) return;

      const message = getErrorMessage(
        error,
        "The library games could not be loaded.",
      );
      snackbar.show("The library games could not be loaded.", "error");
      showLibraryGameListState(
        list,
        createErrorState(message, (): void => void loadGames()),
      );
    }
  };

  void loadGames();

  return section;
};
