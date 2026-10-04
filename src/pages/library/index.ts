import "./library-page.scss";
import { DEFAULT_LIBRARY_GAMES_QUERY } from "../../api";
import type { LibraryGamesQuery } from "../../api";
import { createLibraryControls } from "../../components/library-controls";
import { createLibraryGameList } from "../../components/library-game-list";
import { createLibraryPagination } from "../../components/library-pagination";
import type { SnackbarController } from "../../components/ui/snackbar";

interface LibraryPage {
  element: HTMLElement;
  update: (query: LibraryGamesQuery) => void;
  destroy: () => void;
}

const isSameQuery = (
  first: LibraryGamesQuery,
  second: LibraryGamesQuery,
): boolean =>
  first.category === second.category &&
  first.sort === second.sort &&
  first.page === second.page;

export const createLibraryPage = (
  openGameDetails: (gameSlug: string) => void,
  snackbar: SnackbarController,
  onQueryChange: (query: LibraryGamesQuery) => void,
): LibraryPage => {
  const main: HTMLElement = document.createElement("main");
  main.className = "library-page";

  const section: HTMLElement = document.createElement("section");
  section.className = "library-page__intro";

  const heading: HTMLHeadingElement = document.createElement("h1");
  heading.textContent = "Game Library";

  const description: HTMLParagraphElement = document.createElement("p");
  description.textContent = "Browse our collection of casual mini-games";

  section.append(heading, description);

  let currentQuery: LibraryGamesQuery = DEFAULT_LIBRARY_GAMES_QUERY;
  let totalPages: number = 1;
  let lastRequestedQuery: LibraryGamesQuery | undefined;

  const gameList = createLibraryGameList(
    openGameDetails,
    snackbar,
    (meta): void => {
      totalPages = meta.totalPages;
      pagination.update(meta.page, totalPages);
    },
  );
  const pagination = createLibraryPagination((page: number): void => {
    onQueryChange({ ...currentQuery, page });
  });

  const loadGames = (query: LibraryGamesQuery): void => {
    if (lastRequestedQuery && isSameQuery(lastRequestedQuery, query)) {
      return;
    }

    lastRequestedQuery = query;
    void gameList.load(query);
  };

  const controls = createLibraryControls(
    {
      onFilterChange: (category): void => {
        onQueryChange({ ...currentQuery, category, page: 1 });
      },
      onSortChange: (sort): void => {
        onQueryChange({ ...currentQuery, sort, page: 1 });
      },
    },
    snackbar,
  );

  main.append(section, controls.element, gameList.element, pagination.element);

  return {
    element: main,
    update: (query): void => {
      currentQuery = query;
      controls.update(query);
      pagination.update(query.page, totalPages);
      loadGames(query);
    },
    destroy: (): void => {
      controls.destroy();
      gameList.cancel();
      pagination.destroy();
    },
  };
};
