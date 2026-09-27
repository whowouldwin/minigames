import closeIcon from "../../assets/icons/close.svg";
import favoriteFilledIcon from "../../assets/icons/favorite-filled.svg";
import favoriteOutlineIcon from "../../assets/icons/favorite-outline.svg";
import starIcon from "../../assets/icons/star.svg";
import tukoniCover from "../../assets/images/games/tukoni-forest-keepers.jpg";
import { createGameDetailsTopRecords } from "./game-details-top-records";

export interface GameDetailsContent {
  hero: HTMLElement;
  body: HTMLElement;
  resetFavorite: () => void;
}

interface FavoriteButton {
  element: HTMLButtonElement;
  reset: () => void;
}

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

const createTitleRow = (title: HTMLHeadingElement): HTMLDivElement => {
  const ratings: HTMLDivElement = document.createElement("div");
  ratings.className = "game-details-dialog__ratings";
  ratings.append(
    createRatingItem(starIcon, "4.9"),
    createRatingItem(favoriteFilledIcon, "31.2K"),
  );

  const titleRow: HTMLDivElement = document.createElement("div");
  titleRow.className = "game-details-dialog__title-row";
  titleRow.append(title, ratings);

  return titleRow;
};

const createHero = (close: () => void): HTMLElement => {
  const hero: HTMLElement = document.createElement("header");
  hero.className = "game-details-dialog__hero";

  const cover: HTMLImageElement = document.createElement("img");
  cover.className = "game-details-dialog__cover";
  cover.src = tukoniCover;
  cover.alt = "Tukoni: Forest Keepers game artwork";

  const closeButton: HTMLButtonElement = document.createElement("button");
  closeButton.className = "game-details-dialog__close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close game details");
  closeButton.addEventListener("click", close);

  const closeIconImage: HTMLImageElement = document.createElement("img");
  closeIconImage.src = closeIcon;
  closeIconImage.alt = "";
  closeIconImage.setAttribute("aria-hidden", "true");
  closeButton.append(closeIconImage);
  hero.append(cover, closeButton);

  return hero;
};

const createDescription = (): HTMLParagraphElement => {
  const description: HTMLParagraphElement = document.createElement("p");
  description.className = "game-details-dialog__description";
  description.textContent =
    "Tukoni: Forest Keepers — a cozy hand-drawn puzzle-adventure. You are Traveller, a little forest spirit on an important mission. Wander storybook meadows, visit mushroom villages, meet adorable inhabitants, solve gentle hand-crafted puzzles, brew herbal teas and help the Tukoni forest prepare peacefully for the coming winter.";

  return description;
};

const createGameInfo = (): HTMLDListElement => {
  const gameInfo: HTMLDListElement = document.createElement("dl");
  gameInfo.className = "game-details-dialog__info";

  for (const [label, value] of [
    ["Genre", "Puzzle"],
    ["Players", "Solo"],
    ["Duration", "40-90 min"],
    ["Price", "Free"],
  ]) {
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

const createFavoriteButton = (): FavoriteButton => {
  let isFavorite: boolean = false;

  const button: HTMLButtonElement = document.createElement("button");
  button.className = "game-details-dialog__favorite";
  button.type = "button";

  const icon: HTMLImageElement = document.createElement("img");
  icon.className = "game-details-dialog__favorite-icon";
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");

  const label: HTMLSpanElement = document.createElement("span");
  label.className = "game-details-dialog__favorite-label";

  const update = (): void => {
    const buttonLabel: string = isFavorite
      ? "Remove from Favorites"
      : "Add to Favorites";

    button.classList.toggle(
      "game-details-dialog__favorite--active",
      isFavorite,
    );
    button.setAttribute("aria-label", buttonLabel);
    button.setAttribute("aria-pressed", String(isFavorite));
    icon.src = isFavorite ? favoriteFilledIcon : favoriteOutlineIcon;
    label.textContent = buttonLabel;
  };

  button.addEventListener("click", (): void => {
    isFavorite = !isFavorite;
    update();
  });
  button.append(icon, label);
  update();

  return {
    element: button,
    reset: (): void => {
      isFavorite = false;
      update();
    },
  };
};

const createActions = (favoriteButton: HTMLButtonElement): HTMLDivElement => {
  const playButton: HTMLButtonElement = document.createElement("button");
  playButton.className = "game-details-dialog__play";
  playButton.type = "button";
  playButton.textContent = "Play Now";

  const actions: HTMLDivElement = document.createElement("div");
  actions.className = "game-details-dialog__actions";
  actions.append(playButton, favoriteButton);

  return actions;
};

export const createGameDetailsContent = (
  close: () => void,
): GameDetailsContent => {
  const title: HTMLHeadingElement = document.createElement("h2");
  title.className = "game-details-dialog__title";
  title.id = "game-details-title";
  title.textContent = "Tukoni: Forest Keepers";

  const body: HTMLElement = document.createElement("section");
  body.className = "game-details-dialog__body";
  body.setAttribute("aria-labelledby", title.id);

  const favoriteButton: FavoriteButton = createFavoriteButton();
  body.append(
    createTitleRow(title),
    createDescription(),
    createGameInfo(),
    createActions(favoriteButton.element),
    createGameDetailsTopRecords(),
  );

  return {
    hero: createHero(close),
    body,
    resetFavorite: favoriteButton.reset,
  };
};
