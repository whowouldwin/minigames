import { requestApi } from "./client";
import type { ApiResponse, GameComment, GameCommentsMeta } from "./types";

export interface CommentLikeResponse {
  isLikedByCurrentUser: boolean;
  likesCount: number;
}

export interface CreateGameCommentRequest {
  userEmail: string;
  authorName: string;
  text: string;
}

export interface GameCommentsRequestOptions {
  signal?: AbortSignal;
  userEmail?: string;
}

export const getGameComments = (
  gameSlug: string,
  { signal, userEmail }: GameCommentsRequestOptions = {},
): Promise<ApiResponse<GameComment[], GameCommentsMeta>> => {
  const query = new URLSearchParams({ limit: "3", sort: "newest" });
  if (userEmail) query.set("userEmail", userEmail);
  const path: string = `games/${encodeURIComponent(gameSlug)}/comments?${query}`;

  return requestApi<GameComment[], GameCommentsMeta>(path, { signal });
};

export const createGameComment = (
  gameSlug: string,
  comment: CreateGameCommentRequest,
): Promise<ApiResponse<GameComment>> =>
  requestApi<GameComment>(`games/${encodeURIComponent(gameSlug)}/comments`, {
    method: "POST",
    body: comment,
  });

export const toggleCommentLike = (
  commentId: string,
  userEmail: string,
): Promise<ApiResponse<CommentLikeResponse>> =>
  requestApi<CommentLikeResponse>(
    `comments/${encodeURIComponent(commentId)}/like`,
    { method: "POST", body: { userEmail } },
  );
