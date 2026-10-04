import type { GameDetails, GameDetailsSpecs } from "../../api";
import favoriteFilledIcon from "../../assets/icons/favorite-filled.svg";
import favoriteOutlineIcon from "../../assets/icons/favorite-outline.svg";
import starIcon from "../../assets/icons/star.svg";
import { createGameDetailsTopRecords } from "./game-details-top-records";

const formatCompactCount = (count: number): string =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);

const createTitle = (text: string): HTMLHeadingElement => {
  const title: HTMLHeadingElement = document.createElement("h2");
  title.className = "game-details-dialog__title";
  title.id = "game-details-title";
  title.textContent = text;
  return title;
};

const createRatingItem = (
  iconSource: string,
  value: string,
): HTMLDivElement => {
  const item: HTMLDivElement = document.createElement("div");
  item.className = "game-details-dialog__rating-item";

  const icon: HTMLImageElement = document.createElement("img");
  icon.className = "game-details-dialog__rating-icon";
  icon.src = iconSource;
  icon.alt = "";

  const label: HTMLSpanElement = document.createElement("span");
  label.textContent = value;
  item.append(icon, label);

  return item;
};

const createTitleRow = (game: GameDetails): HTMLDivElement => {
  const ratings: HTMLDivElement = document.createElement("div");
  ratings.className = "game-details-dialog__ratings";
  ratings.append(
    createRatingItem(starIcon, game.rating.toFixed(1)),
    createRatingItem(favoriteFilledIcon, formatCompactCount(game.likesCount)),
  );

  const titleRow: HTMLDivElement = document.createElement("div");
  titleRow.className = "game-details-dialog__title-row";
  titleRow.append(createTitle(game.name), ratings);

  return titleRow;
};

const createDescription = (text: string): HTMLParagraphElement => {
  const description: HTMLParagraphElement = document.createElement("p");
  description.className = "game-details-dialog__description";
  description.textContent = text;
  return description;
};

const createGameInfo = (specs: GameDetailsSpecs): HTMLDListElement => {
  const gameInfo: HTMLDListElement = document.createElement("dl");
  gameInfo.className = "game-details-dialog__info";

  const entries: [string, string][] = [
    ["Genre", specs.genre],
    ["Players", specs.players],
    ["Duration", specs.duration],
    ["Price", specs.price],
  ];

  for (const [label, value] of entries) {
    const entry: HTMLDivElement = document.createElement("div");
    const term: HTMLElement = document.createElement("dt");
    term.textContent = label;
    const detail: HTMLElement = document.createElement("dd");
    detail.textContent = value;
    entry.append(term, detail);
    gameInfo.append(entry);
  }

  return gameInfo;
};

const createFavoriteButton = (isFavorite: boolean): HTMLButtonElement => {
  const button: HTMLButtonElement = document.createElement("button");
  button.className = "game-details-dialog__favorite";
  button.type = "button";
  button.disabled = true;
  button.title = "Favorite changes aren't available yet.";

  const icon: HTMLImageElement = document.createElement("img");
  icon.className = "game-details-dialog__favorite-icon";
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");

  const label: HTMLSpanElement = document.createElement("span");
  label.className = "game-details-dialog__favorite-label";

  const buttonLabel: string = isFavorite
    ? "Remove from Favorites"
    : "Add to Favorites";

  button.classList.toggle("game-details-dialog__favorite--active", isFavorite);
  button.setAttribute("aria-label", buttonLabel);
  button.setAttribute("aria-pressed", String(isFavorite));
  icon.src = isFavorite ? favoriteFilledIcon : favoriteOutlineIcon;
  label.textContent = buttonLabel;
  button.append(icon, label);

  return button;
};

const createActions = (isLikedByCurrentUser: boolean): HTMLDivElement => {
  const playButton: HTMLButtonElement = document.createElement("button");
  playButton.className = "game-details-dialog__play";
  playButton.type = "button";
  playButton.textContent = "Play Now";

  const actions: HTMLDivElement = document.createElement("div");
  actions.className = "game-details-dialog__actions";
  actions.append(playButton, createFavoriteButton(isLikedByCurrentUser));

  return actions;
};

export const createGameDetailsView = (
  game: GameDetails,
  comments: HTMLElement,
): DocumentFragment => {
  const view: DocumentFragment = document.createDocumentFragment();
  view.append(
    createTitleRow(game),
    createDescription(game.fullDescription),
    createGameInfo(game.specs),
    createActions(game.isLikedByCurrentUser),
    createGameDetailsTopRecords(game.topRecords),
    comments,
  );

  return view;
};
