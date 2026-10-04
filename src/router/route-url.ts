import { DEFAULT_LIBRARY_GAMES_QUERY } from "../api";
import type { AppPage } from "../types/app-page";
import type { AppRoute } from "./route-state";
import { readLibraryQuery } from "./read-library-query";
import { readDialogRoute } from "./read-dialog-route";
import { readPageRoute } from "./read-page-route";

const basePath: string = new URL(
  import.meta.env.BASE_URL,
  globalThis.location.origin,
).pathname;

export const getPagePath = (page: AppPage): string =>
  `${basePath}${page === "library" ? "library" : ""}`;

export const readRouteUrl = (url: URL): AppRoute => {
  const pageRoute = readPageRoute(url.pathname, basePath);

  return {
    ...pageRoute,
    library:
      pageRoute.page === "library"
        ? readLibraryQuery(url.searchParams)
        : { ...DEFAULT_LIBRARY_GAMES_QUERY },
    dialog: readDialogRoute(url.searchParams),
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

  const path: string =
    route.page === "not-found" ? route.path : getPagePath(route.page);
  const query: string = search.toString();
  return `${path}${query ? `?${query}` : ""}`;
};
