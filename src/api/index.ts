export { ApiError, appAssetUrl, getErrorMessage } from "./client";
export {
  DEFAULT_LIBRARY_GAMES_QUERY,
  getFeaturedGames,
  getLibraryCategories,
  getLibraryGames,
} from "./game-catalog";
export { getGameDetails } from "./game-details";
export { toggleGameFavorite } from "./game-favorites";
export {
  getGameComments,
  createGameComment,
  toggleCommentLike,
} from "./game-comments";
export type {
  CommentLikeResponse,
  CreateGameCommentRequest,
  GameCommentsRequestOptions,
} from "./game-comments";
export type { FavoriteResponse } from "./game-favorites";
export type { GameDetailsRequestOptions } from "./game-details";
export { getLeaderboard } from "./leaderboard";
export type {
  ApiResponse,
  GameCategory,
  GameCategorySlug,
  GameComment,
  GameCommentsMeta,
  GameDetails,
  GameDetailsRecord,
  GameDetailsSpecs,
  GameSortValue,
  GameSummary,
  LeaderboardMeta,
  LeaderboardPlayer,
  LibraryGamesMeta,
  LibraryGamesQuery,
} from "./types";
