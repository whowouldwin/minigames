export interface ApiResponse<TData, TMeta = undefined> {
  data: TData;
  meta?: TMeta;
}

export interface GameSummary {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
}

export type GameCategorySlug =
  "all" | "puzzle" | "card" | "match" | "farm" | "strategy" | "arcade";

export interface GameCategory {
  slug: GameCategorySlug;
  label: string;
  isDefault: boolean;
}

export type GameSortValue =
  "rating-desc" | "rating-asc" | "name-asc" | "name-desc";

export interface LibraryGamesQuery {
  category: GameCategorySlug;
  sort: GameSortValue;
}

export interface LeaderboardPlayer {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameSlug: string;
  favoriteGameName: string;
}

export interface LeaderboardMeta {
  totalItems: number;
  description: string;
}
