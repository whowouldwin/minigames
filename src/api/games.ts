import { requestApi } from "./client";
import type {
  ApiResponse,
  GameCategory,
  GameDetails,
  GameSummary,
  LibraryGamesMeta,
  LibraryGamesQuery,
} from "./types";

export const DEFAULT_LIBRARY_GAMES_QUERY: LibraryGamesQuery = {
  category: "all",
  sort: "rating-desc",
  page: 1,
};

export interface GameDetailsRequestOptions {
  signal?: AbortSignal;
  userEmail?: string;
}

export const getFeaturedGames = (
  signal?: AbortSignal,
): Promise<ApiResponse<GameSummary[]>> =>
  requestApi<GameSummary[]>("games?featured=true", signal);

export const getGameDetails = (
  gameSlug: string,
  { signal, userEmail }: GameDetailsRequestOptions = {},
): Promise<ApiResponse<GameDetails>> => {
  const query = new URLSearchParams();
  if (userEmail) query.set("userEmail", userEmail);

  const search: string = query.toString();
  const path: string = `games/${encodeURIComponent(gameSlug)}${search ? `?${search}` : ""}`;
  return requestApi<GameDetails>(path, signal);
};

export const getLibraryGames = (
  query: LibraryGamesQuery = DEFAULT_LIBRARY_GAMES_QUERY,
  signal?: AbortSignal,
): Promise<ApiResponse<GameSummary[], LibraryGamesMeta>> => {
  const search = new URLSearchParams({
    page: String(query.page),
    category: query.category,
    sort: query.sort,
    limit: "6",
  });

  return requestApi<GameSummary[], LibraryGamesMeta>(`games?${search}`, signal);
};

export const getLibraryCategories = (
  signal?: AbortSignal,
): Promise<ApiResponse<GameCategory[]>> =>
  requestApi<GameCategory[]>("categories", signal);
