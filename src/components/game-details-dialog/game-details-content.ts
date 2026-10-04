import type { GameDetails } from "../../api";
import {
  createEmptyState,
  createErrorState,
  createRequestSkeleton,
} from "../ui/request-feedback";
import {
  createGameDetailsComments,
  type GameDetailsComments,
} from "./game-details-comments";
import { createGameDetailsHero } from "./game-details-hero";
import { createGameDetailsView } from "./game-details-view";

export interface GameDetailsContent {
  hero: HTMLElement;
  body: HTMLElement;
  showLoading: () => void;
  showError: (message: string, retry: () => void) => void;
  showEmpty: () => void;
  renderGame: (game: GameDetails) => void;
  comments: GameDetailsComments;
}

const createTitle = (text: string): HTMLHeadingElement => {
  const title: HTMLHeadingElement = document.createElement("h2");
  title.className = "game-details-dialog__title";
  title.id = "game-details-title";
  title.textContent = text;
  return title;
};

export const createGameDetailsContent = (
  close: () => void,
): GameDetailsContent => {
  const body: HTMLElement = document.createElement("section");
  body.className = "game-details-dialog__body";
  body.setAttribute("aria-labelledby", "game-details-title");

  const hero = createGameDetailsHero(close);
  const comments = createGameDetailsComments();

  const showLoading = (): void => {
    hero.showLoading();
    body.setAttribute("aria-busy", "true");
    body.replaceChildren(
      createTitle("Loading game details"),
      createRequestSkeleton("Loading game details", "dialog", 7),
    );
  };

  const showError = (message: string, retry: () => void): void => {
    hero.hideImage();
    body.setAttribute("aria-busy", "false");
    body.replaceChildren(
      createTitle("Game details unavailable"),
      createErrorState(message, retry),
    );
  };

  const showEmpty = (): void => {
    hero.hideImage();
    body.setAttribute("aria-busy", "false");
    body.replaceChildren(
      createTitle("Game details unavailable"),
      createEmptyState("No details are available for this game yet."),
    );
  };

  const renderGame = (game: GameDetails): void => {
    hero.showImage(game);
    body.setAttribute("aria-busy", "false");
    body.replaceChildren(createGameDetailsView(game, comments.element));
  };

  showLoading();

  return {
    hero: hero.element,
    body,
    showLoading,
    showError,
    showEmpty,
    renderGame,
    comments,
  };
};
