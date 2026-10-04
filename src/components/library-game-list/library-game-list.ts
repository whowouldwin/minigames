import { getErrorMessage, getLibraryGames } from "../../api";
import type { LibraryGamesMeta, LibraryGamesQuery } from "../../api";
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

interface LibraryGameListController {
  element: HTMLElement;
  load: (query: LibraryGamesQuery) => Promise<void>;
}

export const createLibraryGameList = (
  openDetails: () => void,
  snackbar: SnackbarController,
  onPaginationUpdate: (meta: LibraryGamesMeta) => void,
): LibraryGameListController => {
  const section: HTMLElement = document.createElement("section");
  section.className = "library-game-list";
  section.setAttribute("aria-label", "Games");

  const list: HTMLUListElement = document.createElement("ul");
  list.className = "library-game-list__items";

  section.append(list);

  let requestController: AbortController | undefined;

  const loadGames = async (query: LibraryGamesQuery): Promise<void> => {
    requestController?.abort();
    const controller = new AbortController();
    requestController = controller;

    showLibraryGameListState(
      list,
      createRequestSkeleton("Loading library games", "game-list", 6),
    );

    try {
      const response = await getLibraryGames(query, controller.signal);
      if (!section.isConnected || controller.signal.aborted) return;

      if (!response.meta) {
        throw new Error("The game server did not return pagination metadata.");
      }

      onPaginationUpdate(response.meta);

      if (response.data.length === 0) {
        showLibraryGameListState(
          list,
          createEmptyState("No games are available yet."),
        );
        return;
      }

      renderLibraryGames(list, response.data, openDetails);
    } catch (error) {
      if (!section.isConnected || controller.signal.aborted) return;

      const message = getErrorMessage(
        error,
        "The library games could not be loaded.",
      );
      snackbar.show("The library games could not be loaded.", "error");
      showLibraryGameListState(
        list,
        createErrorState(message, (): void => void loadGames(query)),
      );
    }
  };

  return { element: section, load: loadGames };
};
