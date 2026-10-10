import { getErrorMessage, getLibraryGames } from "../../api";
import type { LibraryGamesMeta, LibraryGamesQuery } from "../../api";
import { createLatestRequest } from "../../utils/latest-request";
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
  cancel: () => void;
}

export const createLibraryGameList = (
  openDetails: (gameSlug: string) => void,
  snackbar: SnackbarController,
  onPaginationUpdate: (meta: LibraryGamesMeta) => void,
): LibraryGameListController => {
  const section: HTMLElement = document.createElement("section");
  section.className = "library-game-list";
  section.setAttribute("aria-label", "Games");

  const list: HTMLUListElement = document.createElement("ul");
  list.className = "library-game-list__items";

  section.append(list);

  const request = createLatestRequest((): boolean => section.isConnected);

  const loadGames = async (query: LibraryGamesQuery): Promise<void> => {
    const controller = request.start();

    showLibraryGameListState(
      list,
      createRequestSkeleton("Loading library games", "game-list", 6),
    );

    try {
      const response = await getLibraryGames(query, controller.signal);
      if (!request.isCurrent(controller)) return;

      if (
        !response.meta ||
        !Number.isSafeInteger(response.meta.page) ||
        response.meta.page < 1 ||
        !Number.isSafeInteger(response.meta.totalPages) ||
        response.meta.totalPages < 0
      ) {
        throw new Error(
          "The game server returned invalid pagination metadata.",
        );
      }

      onPaginationUpdate(response.meta);

      if (response.data.length === 0) {
        showLibraryGameListState(list, createEmptyState("Data Not Found"));
        return;
      }

      renderLibraryGames(list, response.data, openDetails);
    } catch (error) {
      if (!request.isCurrent(controller)) return;

      const message = getErrorMessage(
        error,
        "The library games could not be loaded.",
      );
      snackbar.show("The library games could not be loaded.", "error");
      showLibraryGameListState(
        list,
        createErrorState(message, (): void => void loadGames(query)),
      );
    } finally {
      request.finish(controller);
    }
  };

  return {
    element: section,
    load: loadGames,
    cancel: request.cancel,
  };
};
