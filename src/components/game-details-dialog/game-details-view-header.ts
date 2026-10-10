import type { GameDetails } from "../../api";
import favoriteFilledIcon from "../../assets/icons/favorite-filled.svg";
import starIcon from "../../assets/icons/star.svg";
import { formatCompactCount } from "../../utils/format-compact-count";
import { createGameDetailsTitle } from "./game-details-title";

interface RatingItem {
  element: HTMLDivElement;
  value: HTMLSpanElement;
}

const createRatingItem = (iconSource: string, value: string): RatingItem => {
  const item: HTMLDivElement = document.createElement("div");
  item.className = "game-details-dialog__rating-item";

  const icon: HTMLImageElement = document.createElement("img");
  icon.className = "game-details-dialog__rating-icon";
  icon.src = iconSource;
  icon.alt = "";

  const label: HTMLSpanElement = document.createElement("span");
  label.textContent = value;
  item.append(icon, label);

  return { element: item, value: label };
};

export interface GameDetailsViewHeader {
  element: HTMLDivElement;
  likesCount: HTMLSpanElement;
}

export const createGameDetailsViewHeader = (
  game: GameDetails,
): GameDetailsViewHeader => {
  const ratings: HTMLDivElement = document.createElement("div");
  ratings.className = "game-details-dialog__ratings";

  const rating = createRatingItem(starIcon, game.rating.toFixed(1));
  const likes = createRatingItem(
    favoriteFilledIcon,
    formatCompactCount(game.likesCount),
  );
  ratings.append(rating.element, likes.element);

  const header: HTMLDivElement = document.createElement("div");
  header.className = "game-details-dialog__title-row";
  header.append(createGameDetailsTitle(game.name), ratings);

  return { element: header, likesCount: likes.value };
};
