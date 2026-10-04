import { getErrorMessage, getGameDetails } from "../../api";
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
  let requestController: AbortController | undefined;

  const cancelRequest = (): void => {
    requestController?.abort();
    requestController = undefined;
  };

  const close = async (): Promise<void> => {
    if (isClosing || !dialog.open) return;

    cancelRequest();
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

  const loadGameDetails = async (gameSlug: string): Promise<void> => {
    cancelRequest();
    const controller = new AbortController();
    requestController = controller;
    content.showLoading();

    try {
      const response = await getGameDetails(gameSlug, {
        signal: controller.signal,
      });
      if (
        requestController !== controller ||
        controller.signal.aborted ||
        !dialog.open
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
        requestController !== controller ||
        controller.signal.aborted ||
        !dialog.open
      ) {
        return;
      }

      const message: string = getErrorMessage(
        error,
        "Unable to load game details.",
      );
      content.showError(message, (): void => {
        void loadGameDetails(gameSlug);
      });
      snackbar.show(message, "error");
    } finally {
      if (requestController === controller) requestController = undefined;
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
      content.resetComments();
      dialog.showModal();
      void loadGameDetails(gameSlug);
    },
  };
};
