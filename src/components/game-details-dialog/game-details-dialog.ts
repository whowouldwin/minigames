import closeIcon from "../../assets/icons/close.svg";
import tukoniCover from "../../assets/images/games/tukoni-forest-keepers.jpg";
import "./game-details-dialog.scss";

export interface GameDetailsDialog {
  element: HTMLDialogElement;
  open: () => void;
}

export const createGameDetailsDialog = (): GameDetailsDialog => {
  const dialog: HTMLDialogElement = document.createElement("dialog");
  dialog.className = "game-details-dialog";
  dialog.setAttribute("aria-labelledby", "game-details-title");
  let isClosing: boolean = false;
  let trigger: HTMLElement | undefined;

  const close = async (): Promise<void> => {
    if (isClosing || !dialog.open) return;

    isClosing = true;
    dialog.classList.add("game-details-dialog--closing");
    await Promise.allSettled(
      dialog
        .getAnimations()
        .map((animation: Animation): Promise<Animation> => animation.finished),
    );
    dialog.close();
    dialog.classList.remove("game-details-dialog--closing");
    isClosing = false;

    if (trigger?.isConnected) trigger.focus();
  };

  dialog.addEventListener("cancel", (event: Event): void => {
    event.preventDefault();
    void close();
  });

  let isBackdropDown: boolean = false;
  const isOutside = (event: MouseEvent): boolean => {
    const bounds: DOMRect = dialog.getBoundingClientRect();
    return (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    );
  };

  dialog.addEventListener("pointerdown", (event: PointerEvent): void => {
    isBackdropDown = isOutside(event);
  });
  dialog.addEventListener("click", (event: MouseEvent): void => {
    if (isBackdropDown && isOutside(event)) void close();
  });

  const hero: HTMLElement = document.createElement("header");
  hero.className = "game-details-dialog__hero";

  const cover: HTMLImageElement = document.createElement("img");
  cover.className = "game-details-dialog__cover";
  cover.src = tukoniCover;
  cover.alt = "Tukoni: Forest Keepers game artwork";

  const title: HTMLHeadingElement = document.createElement("h2");
  title.id = "game-details-title";
  title.textContent = "Tukoni: Forest Keepers";

  const body: HTMLElement = document.createElement("section");
  body.className = "game-details-dialog__body";
  body.setAttribute("aria-labelledby", title.id);

  const closeButton: HTMLButtonElement = document.createElement("button");
  closeButton.className = "game-details-dialog__close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close game details");
  closeButton.addEventListener("click", (): void => {
    void close();
  });

  const closeIconImage: HTMLImageElement = document.createElement("img");
  closeIconImage.src = closeIcon;
  closeIconImage.alt = "";
  closeIconImage.setAttribute("aria-hidden", "true");
  closeButton.append(closeIconImage);

  const description: HTMLParagraphElement = document.createElement("p");
  description.textContent =
    "Tukoni: Forest Keepers — a cozy hand-drawn puzzle-adventure. You are Traveller, a little forest spirit on an important mission. Wander storybook meadows, visit mushroom villages, meet adorable inhabitants, solve gentle hand-crafted puzzles, brew herbal teas and help the Tukoni forest prepare peacefully for the coming winter.";

  const gameInfo: HTMLDListElement = document.createElement("dl");
  gameInfo.className = "game-details-dialog__info";
  for (const [label, value] of [
    ["Genre", "Puzzle"],
    ["Players", "Solo"],
    ["Duration", "40–90 min"],
    ["Price", "Free"],
  ]) {
    const entry: HTMLDivElement = document.createElement("div");
    const term: HTMLElement = document.createElement("dt");
    term.textContent = label;
    const detail: HTMLElement = document.createElement("dd");
    detail.textContent = value;
    entry.append(term, detail);
    gameInfo.append(entry);
  }

  const playButton: HTMLButtonElement = document.createElement("button");
  playButton.className = "game-details-dialog__play";
  playButton.type = "button";
  playButton.textContent = "Play Now";

  hero.append(cover, closeButton);
  body.append(title, description, gameInfo, playButton);
  dialog.append(hero, body);

  return {
    element: dialog,
    open: (): void => {
      if (isClosing || dialog.open) return;

      trigger =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : undefined;
      dialog.showModal();
    },
  };
};
