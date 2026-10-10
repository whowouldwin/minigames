import { appAssetUrl } from "../../api";
import type { GameSummary } from "../../api";
import { formatCompactCount } from "../../utils/format-compact-count";
import type { LibraryGame } from "../library-game-card";

export const toLibraryGame = (game: GameSummary): LibraryGame => ({
  slug: game.slug,
  title: game.name,
  category: game.category.slice(0, 1).toUpperCase() + game.category.slice(1),
  price: game.price,
  description: game.shortDescription,
  rating: game.rating.toFixed(1),
  likes: formatCompactCount(game.likesCount),
  image: appAssetUrl(game.cardImage),
});
