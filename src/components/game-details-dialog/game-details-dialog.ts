import type { SnackbarController } from "../ui/snackbar";
import type { AppSession } from "../../auth";
import { closeDialogWithAnimation, setupDialogDismissal } from "../ui/dialog";
import { createGameDetailsContent } from "./game-details-content";
import { createGameDetailsCommentsLoader } from "./game-details-comments-loader";
import { createGameDetailsCommentForm } from "./game-details-comment-form";
import { createGameDetailsLoader } from "./game-details-loader";
import "./game-details-dialog.scss";

export interface GameDetailsDialog {
  element: HTMLDialogElement;
  open: (gameSlug: string) => void;
  close: () => Promise<void>;
}

type AuthenticatedActionGuard = (message?: string) => boolean;

const lockPageScroll = (): (() => void) => {
  const body: HTMLElement = document.body;
  const scrollY: number = window.scrollY;
  const scrollbarWidth: number =
    window.innerWidth - document.documentElement.clientWidth;
  const previousOverflow: string = body.style.overflow;
  const previousPaddingRight: string = body.style.paddingRight;

  body.style.overflow = "hidden";

  if (scrollbarWidth > 0) {
    const bodyPaddingRight: string = getComputedStyle(body).paddingRight;
    body.style.paddingRight = `calc(${bodyPaddingRight} + ${scrollbarWidth}px)`;
  }

  return (): void => {
    body.style.overflow = previousOverflow;
    body.style.paddingRight = previousPaddingRight;
    window.scrollTo(0, scrollY);
  };
};

export const createGameDetailsDialog = (
  snackbar: SnackbarController,
  onClose: () => void,
  getActiveSession: () => AppSession | undefined,
  canContinueWithSession: AuthenticatedActionGuard,
): GameDetailsDialog => {
  const dialog: HTMLDialogElement = document.createElement("dialog");
  dialog.className = "game-details-dialog";
  dialog.setAttribute("aria-labelledby", "game-details-title");

  let isClosing: boolean = false;
  let trigger: HTMLElement | undefined;
  let restorePageScroll: (() => void) | undefined;
  let activeGameSlug: string | undefined;

  const content = createGameDetailsContent(onClose, {
    getActiveSession,
    canContinueWithSession,
    snackbar,
  });
  dialog.append(content.hero, content.body);

  const isDialogOpen = (): boolean => dialog.open;
  const detailsLoader = createGameDetailsLoader({
    content,
    snackbar,
    isDialogOpen,
  });
  const commentsLoader = createGameDetailsCommentsLoader({
    comments: content.comments,
    snackbar,
    isDialogOpen,
  });
  const commentForm = createGameDetailsCommentForm({
    getActiveSession,
    canContinueWithSession,
    snackbar,
    onCommentCreated: async (gameSlug, userEmail): Promise<void> => {
      if (activeGameSlug !== gameSlug || !isDialogOpen()) return;
      await commentsLoader.load(gameSlug, userEmail);
    },
  });
  content.comments.setComposer(commentForm.element);

  const cancelRequests = (): void => {
    detailsLoader.cancel();
    commentsLoader.cancel();
  };

  const close = async (): Promise<void> => {
    if (isClosing || !dialog.open) return;

    cancelRequests();
    isClosing = true;
    await closeDialogWithAnimation(dialog, "game-details-dialog--closing");
    isClosing = false;
    activeGameSlug = undefined;
    restorePageScroll?.();
    restorePageScroll = undefined;

    if (trigger?.isConnected) trigger.focus();
  };

  setupDialogDismissal(dialog, onClose);

  return {
    element: dialog,
    close,
    open: (gameSlug: string): void => {
      if (isClosing || (activeGameSlug === gameSlug && dialog.open)) return;

      if (!dialog.open) {
        trigger =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : undefined;
        restorePageScroll = lockPageScroll();
        dialog.showModal();
      }
      activeGameSlug = gameSlug;
      const session = getActiveSession();
      commentForm.prepareForOpen(gameSlug, session);
      void detailsLoader.load(gameSlug, session?.email);
      void commentsLoader.load(gameSlug, session?.email);
    },
  };
};
