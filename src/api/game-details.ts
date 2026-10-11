import { requestApi } from "./client";
import type { ApiResponse, GameDetails } from "./types";

export interface GameDetailsRequestOptions {
  signal?: AbortSignal;
  userEmail?: string;
}

export const getGameDetails = (
  gameSlug: string,
  { signal, userEmail }: GameDetailsRequestOptions = {},
): Promise<ApiResponse<GameDetails>> => {
  const query = new URLSearchParams();
  if (userEmail) query.set("userEmail", userEmail);

  const search: string = query.toString();
  const path: string = `games/${encodeURIComponent(gameSlug)}${search ? `?${search}` : ""}`;
  return requestApi<GameDetails>(path, { signal });
};
