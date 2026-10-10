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
import type { GameDetailsViewOptions } from "./game-details-view-actions";
import { createGameDetailsTitle } from "./game-details-title";

export interface GameDetailsContent {
  hero: HTMLElement;
  body: HTMLElement;
  showLoading: () => void;
  showError: (message: string, retry: () => void) => void;
  showNotFound: () => void;
  renderGame: (game: GameDetails) => void;
  comments: GameDetailsComments;
}

export const createGameDetailsContent = (
  close: () => void,
  viewOptions: GameDetailsViewOptions,
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
      createGameDetailsTitle("Loading game details"),
      createRequestSkeleton("Loading game details", "dialog", 7),
    );
  };

  const showError = (message: string, retry: () => void): void => {
    hero.hideImage();
    body.setAttribute("aria-busy", "false");
    body.replaceChildren(
      createGameDetailsTitle("Game details unavailable"),
      createErrorState(message, retry),
    );
  };

  const showNotFound = (): void => {
    hero.hideImage();
    body.setAttribute("aria-busy", "false");
    body.replaceChildren(
      createGameDetailsTitle("Game Not Found"),
      createEmptyState("This game doesn't exist or is no longer available."),
    );
  };

  const renderGame = (game: GameDetails): void => {
    hero.showImage(game);
    body.setAttribute("aria-busy", "false");
    body.replaceChildren(
      createGameDetailsView(game, comments.element, viewOptions),
    );
  };

  showLoading();

  return {
    hero: hero.element,
    body,
    showLoading,
    showError,
    showNotFound,
    renderGame,
    comments,
  };
};
