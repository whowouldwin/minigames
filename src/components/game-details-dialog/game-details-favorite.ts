import { ApiError, getErrorMessage, toggleGameFavorite } from "../../api";
import type { AppSession } from "../../auth";
import type { SnackbarController } from "../ui/snackbar";
import favoriteFilledIcon from "../../assets/icons/favorite-filled.svg";
import favoriteOutlineIcon from "../../assets/icons/favorite-outline.svg";

interface GameDetailsFavoriteOptions {
  gameSlug: string;
  isFavorited: boolean;
  likesCount: number;
  getActiveSession: () => AppSession | undefined;
  canContinueWithSession: (message?: string) => boolean;
  snackbar: SnackbarController;
  updateLikesCount: (count: number) => void;
}

const hasFavoriteState = (
  value: unknown,
): value is { isFavorited: boolean; likesCount: number } => {
  if (typeof value !== "object" || value === null) return false;

  const state = value as Record<string, unknown>;
  return (
    typeof state.isFavorited === "boolean" &&
    typeof state.likesCount === "number" &&
    Number.isSafeInteger(state.likesCount) &&
    state.likesCount >= 0
  );
};

export const createGameDetailsFavorite = ({
  gameSlug,
  isFavorited: initialFavorite,
  likesCount: initialLikesCount,
  getActiveSession,
  canContinueWithSession,
  snackbar,
  updateLikesCount,
}: GameDetailsFavoriteOptions): HTMLButtonElement => {
  const button: HTMLButtonElement = document.createElement("button");
  button.className = "game-details-dialog__favorite";
  button.type = "button";

  const icon: HTMLImageElement = document.createElement("img");
  icon.className = "game-details-dialog__favorite-icon";
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");

  const loadingIndicator: HTMLSpanElement = document.createElement("span");
  loadingIndicator.className = "game-details-dialog__favorite-loader";
  loadingIndicator.setAttribute("aria-hidden", "true");
  loadingIndicator.hidden = true;

  const label: HTMLSpanElement = document.createElement("span");
  label.className = "game-details-dialog__favorite-label";

  let isFavorited: boolean = initialFavorite;
  let currentLikesCount: number = initialLikesCount;
  let isPending: boolean = false;
  let hasUnknownOutcome: boolean = false;

  const renderState = (): void => {
    const buttonLabel: string = isPending
      ? "Updating favorite…"
      : isFavorited
        ? "Remove from Favorites"
        : "Add to Favorites";

    button.disabled = isPending || hasUnknownOutcome;
    button.setAttribute("aria-busy", String(isPending));
    button.setAttribute("aria-label", buttonLabel);
    button.setAttribute("aria-pressed", String(isFavorited));
    button.classList.toggle(
      "game-details-dialog__favorite--active",
      isFavorited,
    );
    icon.src = isFavorited ? favoriteFilledIcon : favoriteOutlineIcon;
    icon.hidden = isPending;
    loadingIndicator.hidden = !isPending;
    label.textContent = buttonLabel;
    updateLikesCount(currentLikesCount);
  };

  button.append(icon, loadingIndicator, label);
  button.addEventListener("click", (): void => {
    void toggleFavorite();
  });

  const toggleFavorite = async (): Promise<void> => {
    if (isPending || hasUnknownOutcome) return;

    const session = getActiveSession();
    if (!session) {
      canContinueWithSession("Sign in to add or remove games from Favorites.");
      return;
    }

    isPending = true;
    renderState();

    try {
      const response = await toggleGameFavorite(gameSlug, session.email);
      if (!hasFavoriteState(response.data)) {
        throw new TypeError(
          "The game server returned an invalid favorite state.",
        );
      }

      isFavorited = response.data.isFavorited;
      currentLikesCount = response.data.likesCount;
      snackbar.show(
        isFavorited
          ? "Game added to Favorites."
          : "Game removed from Favorites.",
        "success",
      );
    } catch (error) {
      const isDefinitiveRejection: boolean =
        error instanceof ApiError && error.status >= 400 && error.status < 500;

      if (!isDefinitiveRejection) hasUnknownOutcome = true;

      snackbar.show(
        isDefinitiveRejection
          ? getErrorMessage(error, "Unable to update Favorites.")
          : "The favorite update result is unknown. Reopen game details to check before trying again.",
        isDefinitiveRejection ? "error" : "warning",
      );
    } finally {
      isPending = false;
      renderState();
    }
  };

  renderState();
  return button;
};
