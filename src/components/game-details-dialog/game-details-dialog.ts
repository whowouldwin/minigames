import { getErrorMessage, getGameComments, getGameDetails } from "../../api";
import type { SnackbarController } from "../ui/snackbar";
import { closeDialogWithAnimation, setupDialogDismissal } from "../ui/dialog";
import { createGameDetailsContent } from "./game-details-content";
import "./game-details-dialog.scss";

export interface GameDetailsDialog {
  element: HTMLDialogElement;
  open: (gameSlug: string) => void;
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
): GameDetailsDialog => {
  const dialog: HTMLDialogElement = document.createElement("dialog");
  dialog.className = "game-details-dialog";
  dialog.setAttribute("aria-labelledby", "game-details-title");

  let isClosing: boolean = false;
  let trigger: HTMLElement | undefined;
  let restorePageScroll: (() => void) | undefined;
  let detailsRequest: AbortController | undefined;
  let commentsRequest: AbortController | undefined;
  let requestId: number = 0;

  const cancelRequests = (): void => {
    detailsRequest?.abort();
    commentsRequest?.abort();
    detailsRequest = undefined;
    commentsRequest = undefined;
    requestId += 1;
  };

  const close = async (): Promise<void> => {
    if (isClosing || !dialog.open) return;

    cancelRequests();
    isClosing = true;
    await closeDialogWithAnimation(dialog, "game-details-dialog--closing");
    isClosing = false;
    restorePageScroll?.();
    restorePageScroll = undefined;

    if (trigger?.isConnected) trigger.focus();
  };

  const content = createGameDetailsContent((): void => {
    void close();
  });
  dialog.append(content.hero, content.body);

  const isCurrentRequest = (currentRequestId: number): boolean =>
    currentRequestId === requestId && dialog.open;

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
        content.showEmpty();
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

  const loadGameComments = async (
    gameSlug: string,
    currentRequestId: number,
  ): Promise<void> => {
    if (!isCurrentRequest(currentRequestId)) return;

    commentsRequest?.abort();
    const controller = new AbortController();
    commentsRequest = controller;
    content.comments.showLoading();

    try {
      const response = await getGameComments(gameSlug, controller.signal);
      if (
        commentsRequest !== controller ||
        controller.signal.aborted ||
        !isCurrentRequest(currentRequestId)
      ) {
        return;
      }

      const totalComments: number | undefined = response.meta?.totalComments;
      if (typeof totalComments !== "number" || !Array.isArray(response.data)) {
        throw new TypeError(
          "The game server returned an invalid comments response.",
        );
      }

      content.comments.render(response.data, totalComments);
    } catch (error) {
      if (
        commentsRequest !== controller ||
        controller.signal.aborted ||
        !isCurrentRequest(currentRequestId)
      ) {
        return;
      }

      const message: string = getErrorMessage(
        error,
        "Unable to load comments.",
      );
      content.comments.showError(message, (): void => {
        void loadGameComments(gameSlug, currentRequestId);
      });
      snackbar.show(message, "error");
    } finally {
      if (commentsRequest === controller) commentsRequest = undefined;
    }
  };

  setupDialogDismissal(dialog, (): void => {
    void close();
  });

  return {
    element: dialog,
    open: (gameSlug: string): void => {
      if (isClosing || dialog.open) return;

      trigger =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : undefined;
      restorePageScroll = lockPageScroll();
      dialog.showModal();
      requestId += 1;
      void loadGameDetails(gameSlug, requestId);
      void loadGameComments(gameSlug, requestId);
    },
  };
};
