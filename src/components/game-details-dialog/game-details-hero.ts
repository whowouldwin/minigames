import { appAssetUrl, type GameDetails } from "../../api";
import closeIcon from "../../assets/icons/close.svg";
import { createRequestSkeleton } from "../ui/request-feedback";

export interface GameDetailsHero {
  element: HTMLElement;
  showLoading: () => void;
  showImage: (game: GameDetails) => void;
  hideImage: () => void;
}

export const createGameDetailsHero = (close: () => void): GameDetailsHero => {
  const hero: HTMLElement = document.createElement("header");
  hero.className = "game-details-dialog__hero";

  const skeleton = createRequestSkeleton("Loading game artwork", "dialog", 1);
  skeleton.classList.add("game-details-dialog__hero-skeleton");

  const cover: HTMLImageElement = document.createElement("img");
  cover.className = "game-details-dialog__cover";
  cover.hidden = true;
  let imageUrl: string = "";
  cover.addEventListener("load", (): void => {
    if (cover.src !== imageUrl) return;
    cover.hidden = false;
    skeleton.hidden = true;
  });
  cover.addEventListener("error", (): void => {
    if (cover.src !== imageUrl) return;
    cover.hidden = true;
    skeleton.hidden = true;
  });

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
  hero.append(cover, skeleton, closeButton);

  return {
    element: hero,
    showLoading: (): void => {
      hero.hidden = false;
      hero.classList.remove("game-details-dialog__hero--feedback");
      imageUrl = "";
      cover.hidden = true;
      skeleton.hidden = false;
    },
    showImage: (game: GameDetails): void => {
      imageUrl = appAssetUrl(game.heroImage);
      cover.alt = `${game.name} game artwork`;
      cover.hidden = true;
      skeleton.hidden = false;
      hero.hidden = false;
      hero.classList.remove("game-details-dialog__hero--feedback");
      cover.src = imageUrl;
      if (!cover.complete || cover.naturalWidth === 0) return;

      cover.hidden = false;
      skeleton.hidden = true;
    },
    hideImage: (): void => {
      hero.hidden = false;
      hero.classList.add("game-details-dialog__hero--feedback");
      imageUrl = "";
      cover.hidden = true;
      skeleton.hidden = true;
    },
  };
};
