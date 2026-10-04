import "./library-page.scss";
import { DEFAULT_LIBRARY_GAMES_QUERY } from "../../api";
import type { LibraryGamesQuery } from "../../api";
import { createLibraryControls } from "../../components/library-controls";
import { createLibraryGameList } from "../../components/library-game-list";
import { createLibraryPagination } from "../../components/library-pagination";
import type { SnackbarController } from "../../components/ui/snackbar";

export const createLibraryPage = (
  openGameDetails: (gameSlug: string) => void,
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

  let selectedQuery: LibraryGamesQuery = DEFAULT_LIBRARY_GAMES_QUERY;
  let lastRequestedQuery: LibraryGamesQuery | undefined;

  const gameList = createLibraryGameList(
    openGameDetails,
    snackbar,
    (meta): void => pagination.update(meta.page, meta.totalPages),
  );
  const pagination = createLibraryPagination((page: number): void => {
    selectedQuery = { ...selectedQuery, page };
    loadGames(selectedQuery);
  });

  const loadGames = (query: LibraryGamesQuery): void => {
    if (
      lastRequestedQuery &&
      lastRequestedQuery.category === query.category &&
      lastRequestedQuery.sort === query.sort &&
      lastRequestedQuery.page === query.page
    ) {
      return;
    }

    lastRequestedQuery = query;
    void gameList.load(query);
  };

  const controls = createLibraryControls(
    {
      onFilterChange: (query: LibraryGamesQuery): void => {
        selectedQuery = { ...query, page: 1 };
        loadGames(selectedQuery);
      },
      onSortChange: (sort): void => {
        selectedQuery = { ...selectedQuery, sort, page: 1 };
        loadGames(selectedQuery);
      },
    },
    snackbar,
  );

  main.append(section, controls, gameList.element, pagination.element);

  loadGames(DEFAULT_LIBRARY_GAMES_QUERY);

  return main;
};
