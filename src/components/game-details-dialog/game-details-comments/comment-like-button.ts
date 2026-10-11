import { ApiError, getErrorMessage, toggleCommentLike } from "../../../api";
import type { GameComment } from "../../../api";
import type { AppSession } from "../../../auth";
import type { SnackbarController } from "../../ui/snackbar";
import favoriteFilledIcon from "../../../assets/icons/favorite-filled.svg";
import favoriteOutlineIcon from "../../../assets/icons/favorite-outline.svg";

interface CommentLikeButtonOptions {
  comment: GameComment;
  getActiveSession: () => AppSession | undefined;
  canContinueWithSession: (message?: string) => boolean;
  snackbar: SnackbarController;
}

type LikeRequestState = "idle" | "pending" | "unknown";

const isCommentLikeResponse = (
  value: unknown,
): value is { isLikedByCurrentUser: boolean; likesCount: number } => {
  if (typeof value !== "object" || value === null) return false;

  const state = value as Record<string, unknown>;
  return (
    typeof state.isLikedByCurrentUser === "boolean" &&
    typeof state.likesCount === "number" &&
    Number.isSafeInteger(state.likesCount) &&
    state.likesCount >= 0
  );
};

const isDefinitiveRejection = (error: unknown): boolean =>
  error instanceof ApiError &&
  error.status >= 400 &&
  error.status < 500 &&
  error.status !== 408;

export const createCommentLikeButton = ({
  comment,
  getActiveSession,
  canContinueWithSession,
  snackbar,
}: CommentLikeButtonOptions): HTMLButtonElement => {
  const button: HTMLButtonElement = document.createElement("button");
  button.className = "game-details-comments__likes";
  button.type = "button";

  const icon: HTMLImageElement = document.createElement("img");
  icon.className = "game-details-comments__likes-icon";
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");

  const loader: HTMLSpanElement = document.createElement("span");
  loader.className = "game-details-comments__likes-loader";
  loader.setAttribute("aria-hidden", "true");

  const count: HTMLSpanElement = document.createElement("span");

  let isLiked: boolean = comment.isLikedByCurrentUser;
  let likesCount: number = comment.likesCount;
  let requestState: LikeRequestState = "idle";

  const render = (): void => {
    const isPending: boolean = requestState === "pending";
    const label: string = isPending
      ? "Updating comment like…"
      : `${isLiked ? "Unlike" : "Like"} comment (${likesCount} likes)`;

    button.disabled = requestState !== "idle";
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", String(isLiked));
    button.setAttribute("aria-busy", String(isPending));
    button.classList.toggle("game-details-comments__likes--active", isLiked);
    icon.src = isLiked ? favoriteFilledIcon : favoriteOutlineIcon;
    icon.hidden = isPending;
    loader.hidden = !isPending;
    count.textContent = String(likesCount);
  };

  const toggleLike = async (): Promise<void> => {
    if (requestState !== "idle") return;

    const session = getActiveSession();
    if (!session) {
      canContinueWithSession("Sign in to like comments.");
      return;
    }

    requestState = "pending";
    render();

    try {
      const response = await toggleCommentLike(
        comment.commentId,
        session.email,
      );
      if (!isCommentLikeResponse(response.data)) {
        throw new TypeError(
          "The game server returned an invalid comment like state.",
        );
      }

      isLiked = response.data.isLikedByCurrentUser;
      likesCount = response.data.likesCount;
      snackbar.show(
        isLiked ? "Comment liked." : "Comment like removed.",
        "success",
      );
    } catch (error) {
      const isRejected: boolean = isDefinitiveRejection(error);

      if (!isRejected) requestState = "unknown";

      snackbar.show(
        isRejected
          ? getErrorMessage(error, "Unable to update comment like.")
          : "Like result unknown. Reopen game details to check before retrying.",
        isRejected ? "error" : "warning",
      );
    } finally {
      if (requestState === "pending") requestState = "idle";
      render();
    }
  };

  button.append(icon, loader, count);
  button.addEventListener("click", (): void => {
    void toggleLike();
  });
  render();

  return button;
};
