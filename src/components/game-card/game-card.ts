import favoriteIcon from "../../assets/icons/favorite.svg";
import starIcon from "../../assets/icons/star.svg";

import "./game-card.scss";

export interface GameCardData {
  slug: string;
  title: string;
  image: string;
  rating: string;
  likes: string;
}

const createStat = (iconSource: string, value: string): HTMLDivElement => {
  const stat: HTMLDivElement = document.createElement("div");
  stat.className = "game-card__stat";

  const icon: HTMLImageElement = document.createElement("img");
  icon.className = "game-card__stat-icon";
  icon.src = iconSource;
  icon.alt = "";

  const text: HTMLSpanElement = document.createElement("span");
  text.className = "game-card__stat-value";
  text.textContent = value;

  stat.append(icon, text);

  return stat;
};

export const createGameCard = (game: GameCardData): HTMLElement => {
  const card: HTMLElement = document.createElement("article");
  card.className = "game-card";

  const image: HTMLImageElement = document.createElement("img");
  image.className = "game-card__image";
  image.src = game.image;
  image.alt = game.title;

  const shade: HTMLDivElement = document.createElement("div");
  shade.className = "game-card__shade";
  shade.setAttribute("aria-hidden", "true");

  const overlay: HTMLDivElement = document.createElement("div");
  overlay.className = "game-card__overlay";

  const title: HTMLHeadingElement = document.createElement("h3");
  title.className = "game-card__title";
  title.textContent = game.title;

  const stats: HTMLDivElement = document.createElement("div");
  stats.className = "game-card__stats";

  const rating: HTMLDivElement = createStat(starIcon, game.rating);
  const likes: HTMLDivElement = createStat(favoriteIcon, game.likes);

  stats.append(rating, likes);
  overlay.append(title, stats);

  card.append(image, shade, overlay);

  return card;
};
