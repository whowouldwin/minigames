import { closeDialogWithAnimation, setupDialogDismissal } from "../ui/dialog";
import { createGameDetailsContent } from "./game-details-content";
import "./game-details-dialog.scss";

export interface GameDetailsDialog {
  element: HTMLDialogElement;
  open: () => void;
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

export const createGameDetailsDialog = (): GameDetailsDialog => {
  const dialog: HTMLDialogElement = document.createElement("dialog");
  dialog.className = "game-details-dialog";
  dialog.setAttribute("aria-labelledby", "game-details-title");

  let isClosing: boolean = false;
  let trigger: HTMLElement | undefined;
  let restorePageScroll: (() => void) | undefined;

  const close = async (): Promise<void> => {
    if (isClosing || !dialog.open) return;

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

  setupDialogDismissal(dialog, (): void => {
    void close();
  });

  return {
    element: dialog,
    open: (): void => {
      if (isClosing || dialog.open) return;

      content.resetFavorite();
      trigger =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : undefined;
      restorePageScroll = lockPageScroll();
      dialog.showModal();
    },
  };
};
