import { requestApi } from "./client";
import type { ApiResponse } from "./types";

export interface FavoriteResponse {
  isFavorited: boolean;
  likesCount: number;
}

export const toggleGameFavorite = (
  gameSlug: string,
  userEmail: string,
): Promise<ApiResponse<FavoriteResponse>> =>
  requestApi<FavoriteResponse>(
    `games/${encodeURIComponent(gameSlug)}/favorite`,
    { method: "POST", body: { userEmail } },
  );
