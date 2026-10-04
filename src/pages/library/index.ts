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
  let lastRequestedQuery: LibraryGamesQuery | undefined;
  const loadGames = (query: LibraryGamesQuery): void => {
    if (
      lastRequestedQuery &&
      lastRequestedQuery.category === query.category &&
      lastRequestedQuery.sort === query.sort
    ) {
      return;
    }

    lastRequestedQuery = query;
    void gameList.load(query);
  };

  const controls = createLibraryControls(
    {
      onFilterChange: (query: LibraryGamesQuery): void => {
        selectedQuery = query;
        loadGames(query);
      },
      onSortChange: (sort): void => {
        selectedQuery = { ...selectedQuery, sort };
        loadGames(selectedQuery);
      },
    },
    snackbar,
  );

  main.append(section, controls, gameList.element, createLibraryPagination());

  loadGames(DEFAULT_LIBRARY_GAMES_QUERY);

  return main;
};
