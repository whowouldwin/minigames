import { requestApi } from "./client";
import type { ApiResponse, GameSummary } from "./types";

export const getFeaturedGames = (
  signal?: AbortSignal,
): Promise<ApiResponse<GameSummary[]>> =>
  requestApi<GameSummary[]>("games?featured=true", signal);
