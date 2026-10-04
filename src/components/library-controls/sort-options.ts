import { DEFAULT_LIBRARY_GAMES_QUERY } from "../../api";
import type { GameSortValue } from "../../api";

export interface SortOption {
  label: string;
  value: GameSortValue;
}

export const defaultSortOption: SortOption = {
  label: "Rating ↓",
  value: DEFAULT_LIBRARY_GAMES_QUERY.sort,
};

export const sortOptions: readonly SortOption[] = [
  defaultSortOption,
  { label: "Rating ↑", value: "rating-asc" },
  { label: "Name A→Z", value: "name-asc" },
  { label: "Name Z→A", value: "name-desc" },
];
