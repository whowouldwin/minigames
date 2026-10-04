import { DEFAULT_LIBRARY_GAMES_QUERY } from "../api";
import type {
  GameCategorySlug,
  GameSortValue,
  LibraryGamesQuery,
} from "../api";

const categoryValues: readonly GameCategorySlug[] = [
  "all",
  "puzzle",
  "card",
  "match",
  "farm",
  "strategy",
  "arcade",
];
const sortValues: readonly GameSortValue[] = [
  "rating-desc",
  "rating-asc",
  "name-asc",
  "name-desc",
];

export const readLibraryQuery = (
  search: URLSearchParams,
): LibraryGamesQuery => {
  const category =
    categoryValues.find((value) => value === search.get("category")) ??
    DEFAULT_LIBRARY_GAMES_QUERY.category;
  const sort =
    sortValues.find((value) => value === search.get("sort")) ??
    DEFAULT_LIBRARY_GAMES_QUERY.sort;
  const page = Number(search.get("page"));

  return {
    category,
    sort,
    page: Number.isSafeInteger(page) && page >= 1 ? page : 1,
  };
};
