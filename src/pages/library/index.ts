import "./library-page.scss";
import { DEFAULT_LIBRARY_GAMES_QUERY } from "../../api";
import type { LibraryGamesQuery } from "../../api";
import { createLibraryControls } from "../../components/library-controls";
import { createLibraryGameList } from "../../components/library-game-list";
import { createLibraryPagination } from "../../components/library-pagination";
import type { SnackbarController } from "../../components/ui/snackbar";

export const createLibraryPage = (
  openGameDetails: () => void,
  snackbar: SnackbarController,
): HTMLElement => {
  const main: HTMLElement = document.createElement("main");
  main.className = "library-page";

  const section: HTMLElement = document.createElement("section");
  section.className = "library-page__intro";

  const heading: HTMLHeadingElement = document.createElement("h1");
  heading.textContent = "Game Library";

  const description: HTMLParagraphElement = document.createElement("p");
  description.textContent = "Browse our collection of casual mini-games";

  section.append(heading, description);

  const gameList = createLibraryGameList(openGameDetails, snackbar);
  let selectedQuery: LibraryGamesQuery = DEFAULT_LIBRARY_GAMES_QUERY;
  let lastRequestedQuery: LibraryGamesQuery = DEFAULT_LIBRARY_GAMES_QUERY;
  const controls = createLibraryControls(
    {
      onFilterChange: (query: LibraryGamesQuery): void => {
        selectedQuery = query;
        const hasRequestChanged =
          query.category !== lastRequestedQuery.category ||
          query.sort !== lastRequestedQuery.sort;

        if (!hasRequestChanged) return;

        lastRequestedQuery = query;
        void gameList.load(query);
      },
      onSortChange: (sort): void => {
        selectedQuery = { ...selectedQuery, sort };
      },
    },
    snackbar,
  );

  main.append(section, controls, gameList.element, createLibraryPagination());

  void gameList.load(DEFAULT_LIBRARY_GAMES_QUERY);

  return main;
};
