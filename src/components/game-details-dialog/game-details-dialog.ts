import closeIcon from "../../assets/icons/close.svg";
import favoriteFilledIcon from "../../assets/icons/favorite-filled.svg";
import favoriteOutlineIcon from "../../assets/icons/favorite-outline.svg";
import starIcon from "../../assets/icons/star.svg";
import tukoniCover from "../../assets/images/games/tukoni-forest-keepers.jpg";
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

const createRatingItem = (
  iconSource: string,
  value: string,
): HTMLDivElement => {
  const item: HTMLDivElement = document.createElement("div");
  item.className = "game-details-dialog__rating-item";

  const icon: HTMLImageElement = document.createElement("img");
  icon.className = "game-details-dialog__rating-icon";
  icon.src = iconSource;
  icon.alt = "";

  const label: HTMLSpanElement = document.createElement("span");
  label.textContent = value;

  item.append(icon, label);

  return item;
};

export const createGameDetailsDialog = (): GameDetailsDialog => {
  const dialog: HTMLDialogElement = document.createElement("dialog");
  dialog.className = "game-details-dialog";
  dialog.setAttribute("aria-labelledby", "game-details-title");
  let isClosing: boolean = false;
  let isFavorite: boolean = false;
  let trigger: HTMLElement | undefined;
  let restorePageScroll: (() => void) | undefined;

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
    restorePageScroll?.();
    restorePageScroll = undefined;

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
  title.className = "game-details-dialog__title";
  title.id = "game-details-title";
  title.textContent = "Tukoni: Forest Keepers";

  const titleRow: HTMLDivElement = document.createElement("div");
  titleRow.className = "game-details-dialog__title-row";

  const ratings: HTMLDivElement = document.createElement("div");
  ratings.className = "game-details-dialog__ratings";
  ratings.append(
    createRatingItem(starIcon, "4.9"),
    createRatingItem(favoriteFilledIcon, "31.2K"),
  );
  titleRow.append(title, ratings);

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
  description.className = "game-details-dialog__description";
  description.textContent =
    "Tukoni: Forest Keepers — a cozy hand-drawn puzzle-adventure. You are Traveller, a little forest spirit on an important mission. Wander storybook meadows, visit mushroom villages, meet adorable inhabitants, solve gentle hand-crafted puzzles, brew herbal teas and help the Tukoni forest prepare peacefully for the coming winter.";

  const gameInfo: HTMLDListElement = document.createElement("dl");
  gameInfo.className = "game-details-dialog__info";
  for (const [label, value] of [
    ["Genre", "Puzzle"],
    ["Players", "Solo"],
    ["Duration", "40-90 min"],
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

  const actions: HTMLDivElement = document.createElement("div");
  actions.className = "game-details-dialog__actions";

  const favoriteButton: HTMLButtonElement = document.createElement("button");
  favoriteButton.className = "game-details-dialog__favorite";
  favoriteButton.type = "button";
  favoriteButton.setAttribute("aria-pressed", "false");

  const favoriteIcon: HTMLImageElement = document.createElement("img");
  favoriteIcon.className = "game-details-dialog__favorite-icon";
  favoriteIcon.alt = "";
  favoriteIcon.setAttribute("aria-hidden", "true");

  const favoriteLabel: HTMLSpanElement = document.createElement("span");
  favoriteLabel.className = "game-details-dialog__favorite-label";

  const updateFavoriteButton = (): void => {
    const label: string = isFavorite
      ? "Remove from Favorites"
      : "Add to Favorites";
    favoriteButton.classList.toggle(
      "game-details-dialog__favorite--active",
      isFavorite,
    );
    favoriteButton.setAttribute("aria-label", label);
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    favoriteIcon.src = isFavorite ? favoriteFilledIcon : favoriteOutlineIcon;
    favoriteLabel.textContent = label;
  };

  favoriteButton.addEventListener("click", (): void => {
    isFavorite = !isFavorite;
    updateFavoriteButton();
  });
  favoriteButton.append(favoriteIcon, favoriteLabel);
  updateFavoriteButton();
  actions.append(playButton, favoriteButton);

  hero.append(cover, closeButton);
  body.append(titleRow, description, gameInfo, actions);
  dialog.append(hero, body);

  return {
    element: dialog,
    open: (): void => {
      if (isClosing || dialog.open) return;

      isFavorite = false;
      updateFavoriteButton();
      trigger =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : undefined;
      restorePageScroll = lockPageScroll();
      dialog.showModal();
    },
  };
};
