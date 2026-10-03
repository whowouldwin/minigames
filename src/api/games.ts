import { requestApi } from "./client";
import type {
  ApiResponse,
  GameCategory,
  GameSummary,
  LibraryGamesQuery,
} from "./types";

const defaultLibraryGamesQuery: LibraryGamesQuery = {
  category: "all",
  sort: "rating-desc",
};

export const getFeaturedGames = (
  signal?: AbortSignal,
): Promise<ApiResponse<GameSummary[]>> =>
  requestApi<GameSummary[]>("games?featured=true", signal);

export const getLibraryGames = (
  query: LibraryGamesQuery = defaultLibraryGamesQuery,
  signal?: AbortSignal,
): Promise<ApiResponse<GameSummary[]>> => {
  const search = new URLSearchParams({
    category: query.category,
    sort: query.sort,
    limit: "6",
  });

  return requestApi<GameSummary[]>(`games?${search}`, signal);
};

export const getLibraryCategories = (
  signal?: AbortSignal,
): Promise<ApiResponse<GameCategory[]>> =>
  requestApi<GameCategory[]>("categories", signal);
