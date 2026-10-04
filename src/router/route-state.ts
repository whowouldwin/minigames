import { DEFAULT_LIBRARY_GAMES_QUERY } from "../api";
import type { LibraryGamesQuery } from "../api";
import type { AuthMode } from "../components/auth-dialog";
import type { AppPage } from "../types/app-page";

export type DialogRoute =
  { kind: "game"; gameSlug: string } | { kind: "auth"; mode: AuthMode };

export interface AppRoute {
  page: AppPage;
  library: LibraryGamesQuery;
  dialog?: DialogRoute;
}

export const createPageRoute = (page: AppPage): AppRoute => ({
  page,
  library: { ...DEFAULT_LIBRARY_GAMES_QUERY },
});
