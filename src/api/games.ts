import { requestApi } from "./client";
import type { ApiResponse, GameSummary } from "./types";

export const getFeaturedGames = (
  signal?: AbortSignal,
): Promise<ApiResponse<GameSummary[]>> =>
  requestApi<GameSummary[]>("games?featured=true", signal);

export const getLibraryGames = (
  signal?: AbortSignal,
): Promise<ApiResponse<GameSummary[]>> =>
  requestApi<GameSummary[]>("games?limit=6", signal);
