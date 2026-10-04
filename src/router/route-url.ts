import { DEFAULT_LIBRARY_GAMES_QUERY } from "../api";
import type {
  GameCategorySlug,
  GameSortValue,
  LibraryGamesQuery,
} from "../api";
import type { AppPage } from "../types/app-page";
import type { AppRoute, DialogRoute } from "./route-state";

const categoryValues: readonly GameCategorySlug[] = [
  "all",
  "puzzle",
  "card",
  "match",
  "farm",
  "strategy",
  "arcade",
];
const sortValues: readonly GameSortValue[] = [
  "rating-desc",
  "rating-asc",
  "name-asc",
  "name-desc",
];
const basePath: string = new URL(
  import.meta.env.BASE_URL,
  globalThis.location.origin,
).pathname;

export const getPagePath = (page: AppPage): string =>
  `${basePath}${page === "library" ? "library" : ""}`;

const readLibraryQuery = (search: URLSearchParams): LibraryGamesQuery => {
  const category =
    categoryValues.find((value) => value === search.get("category")) ??
    DEFAULT_LIBRARY_GAMES_QUERY.category;
  const sort =
    sortValues.find((value) => value === search.get("sort")) ??
    DEFAULT_LIBRARY_GAMES_QUERY.sort;
  const page = Number(search.get("page"));

  return {
    category,
    sort,
    page: Number.isSafeInteger(page) && page >= 1 ? page : 1,
  };
};

const readDialog = (search: URLSearchParams): DialogRoute | undefined => {
  const gameSlug = search.get("game");
  if (gameSlug) return { kind: "game", gameSlug };

  const mode = search.get("auth");
  return mode === "login" || mode === "register"
    ? { kind: "auth", mode }
    : undefined;
};

export const readRouteUrl = (url: URL): AppRoute => {
  const page: AppPage =
    url.pathname.replace(/\/$/, "") === getPagePath("library")
      ? "library"
      : "home";

  return {
    page,
    library:
      page === "library"
        ? readLibraryQuery(url.searchParams)
        : { ...DEFAULT_LIBRARY_GAMES_QUERY },
    dialog: readDialog(url.searchParams),
  };
};

export const createRouteUrl = (route: AppRoute): string => {
  const search = new URLSearchParams();
  if (route.page === "library") {
    search.set("category", route.library.category);
    search.set("sort", route.library.sort);
    search.set("page", String(route.library.page));
  }

  if (route.dialog?.kind === "game") {
    search.set("game", route.dialog.gameSlug);
  } else if (route.dialog?.kind === "auth") {
    search.set("auth", route.dialog.mode);
  }

  const query: string = search.toString();
  return `${getPagePath(route.page)}${query ? `?${query}` : ""}`;
};
