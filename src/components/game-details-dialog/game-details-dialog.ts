import "./game-details-dialog.scss";

export interface GameDetailsDialog {
  element: HTMLDialogElement;
  open: () => void;
}

export const createGameDetailsDialog = (): GameDetailsDialog => {
  const dialog: HTMLDialogElement = document.createElement("dialog");
  dialog.className = "game-details-dialog";
  dialog.setAttribute("aria-labelledby", "game-details-title");

  const header: HTMLDivElement = document.createElement("div");
  header.className = "game-details-dialog__header";

  const title: HTMLHeadingElement = document.createElement("h2");
  title.id = "game-details-title";
  title.textContent = "Tukoni: Forest Keepers";

  const closeButton: HTMLButtonElement = document.createElement("button");
  closeButton.className = "game-details-dialog__close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close game details");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", (): void => dialog.close());

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

  header.append(title, closeButton);
  dialog.append(header, description, gameInfo, playButton);

  return {
    element: dialog,
    open: (): void => {
      if (!dialog.open) dialog.showModal();
    },
  };
};
