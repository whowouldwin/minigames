import type { GameDetails } from "../../api";
import type { AppSession } from "../../auth";
import type { SnackbarController } from "../ui/snackbar";
import { formatCompactCount } from "../../utils/format-compact-count";
import { createGameDetailsFavorite } from "./game-details-favorite";

export interface GameDetailsViewOptions {
  getActiveSession: () => AppSession | undefined;
  canContinueWithSession: (message?: string) => boolean;
  snackbar: SnackbarController;
}

export const createGameDetailsViewActions = (
  game: GameDetails,
  likesCount: HTMLSpanElement,
  options: GameDetailsViewOptions,
): HTMLDivElement => {
  const playButton: HTMLButtonElement = document.createElement("button");
  playButton.className = "game-details-dialog__play";
  playButton.type = "button";
  playButton.textContent = "Play Now";

  const favoriteButton = createGameDetailsFavorite({
    gameSlug: game.slug,
    isFavorited: game.isLikedByCurrentUser,
    likesCount: game.likesCount,
    getActiveSession: options.getActiveSession,
    canContinueWithSession: options.canContinueWithSession,
    snackbar: options.snackbar,
    updateLikesCount: (count): void => {
      likesCount.textContent = formatCompactCount(count);
    },
  });

  const actions: HTMLDivElement = document.createElement("div");
  actions.className = "game-details-dialog__actions";
  actions.append(playButton, favoriteButton);

  return actions;
};
