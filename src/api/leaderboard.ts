import { requestApi } from "./client";
import type { ApiResponse, LeaderboardMeta, LeaderboardPlayer } from "./types";

export const getLeaderboard = (
  signal?: AbortSignal,
): Promise<ApiResponse<LeaderboardPlayer[], LeaderboardMeta>> =>
  requestApi<LeaderboardPlayer[], LeaderboardMeta>("leaderboard", { signal });
