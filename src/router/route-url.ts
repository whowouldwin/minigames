import { DEFAULT_LIBRARY_GAMES_QUERY } from "../api";
import type { AppPage } from "../types/app-page";
import type { AppRoute } from "./route-state";
import { readLibraryQuery } from "./read-library-query";
import { readDialogRoute } from "./read-dialog-route";

const basePath: string = new URL(
  import.meta.env.BASE_URL,
  globalThis.location.origin,
).pathname;

export const getPagePath = (page: AppPage): string =>
  `${basePath}${page === "library" ? "library" : ""}`;

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

  const query: string = search.toString();
  return `${getPagePath(route.page)}${query ? `?${query}` : ""}`;
};
