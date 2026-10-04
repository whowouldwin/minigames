import { getErrorMessage, getGameDetails } from "../../api";
import type { SnackbarController } from "../ui/snackbar";
import { closeDialogWithAnimation, setupDialogDismissal } from "../ui/dialog";
import { createGameDetailsContent } from "./game-details-content";
import { createGameDetailsCommentsLoader } from "./game-details-comments-loader";
import "./game-details-dialog.scss";

export interface GameDetailsDialog {
  element: HTMLDialogElement;
  open: (gameSlug: string) => void;
  close: () => Promise<void>;
}

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
): GameDetailsDialog => {
  const dialog: HTMLDialogElement = document.createElement("dialog");
  dialog.className = "game-details-dialog";
  dialog.setAttribute("aria-labelledby", "game-details-title");

  let isClosing: boolean = false;
  let trigger: HTMLElement | undefined;
  let restorePageScroll: (() => void) | undefined;
  let detailsRequest: AbortController | undefined;
  let requestId: number = 0;
  let activeGameSlug: string | undefined;

  const cancelRequests = (): void => {
    detailsRequest?.abort();
    detailsRequest = undefined;
    commentsLoader.cancel();
    requestId += 1;
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

  const content = createGameDetailsContent(onClose);
  dialog.append(content.hero, content.body);

  const isCurrentRequest = (currentRequestId: number): boolean =>
    currentRequestId === requestId && dialog.open;

  const commentsLoader = createGameDetailsCommentsLoader({
    comments: content.comments,
    snackbar,
    isDialogOpen: (): boolean => dialog.open,
  });

  const loadGameDetails = async (
    gameSlug: string,
    currentRequestId: number,
  ): Promise<void> => {
    if (!isCurrentRequest(currentRequestId)) return;

    detailsRequest?.abort();
    const controller = new AbortController();
    detailsRequest = controller;
    content.showLoading();

    try {
      const response = await getGameDetails(gameSlug, {
        signal: controller.signal,
      });
      if (
        detailsRequest !== controller ||
        controller.signal.aborted ||
        !isCurrentRequest(currentRequestId)
      ) {
        return;
      }

      if (!response.data) {
        content.showNotFound();
        return;
      }

      content.renderGame(response.data);
    } catch (error) {
      if (
        detailsRequest !== controller ||
        controller.signal.aborted ||
        !isCurrentRequest(currentRequestId)
      ) {
        return;
      }

      const message: string = getErrorMessage(
        error,
        "Unable to load game details.",
      );
      content.showError(message, (): void => {
        void loadGameDetails(gameSlug, currentRequestId);
      });
      snackbar.show(message, "error");
    } finally {
      if (detailsRequest === controller) detailsRequest = undefined;
    }
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
      requestId += 1;
      void loadGameDetails(gameSlug, requestId);
      void commentsLoader.load(gameSlug);
    },
  };
};
