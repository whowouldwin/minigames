import type { GameDetailsSpecs } from "../../api";

export const createGameDetailsDescription = (
  text: string,
): HTMLParagraphElement => {
  const description: HTMLParagraphElement = document.createElement("p");
  description.className = "game-details-dialog__description";
  description.textContent = text;
  return description;
};

export const createGameDetailsInfo = (
  specs: GameDetailsSpecs,
): HTMLDListElement => {
  const gameInfo: HTMLDListElement = document.createElement("dl");
  gameInfo.className = "game-details-dialog__info";

  const entries: [string, string][] = [
    ["Genre", specs.genre],
    ["Players", specs.players],
    ["Duration", specs.duration],
    ["Price", specs.price],
  ];

  for (const [label, value] of entries) {
    const entry: HTMLDivElement = document.createElement("div");
    const term: HTMLElement = document.createElement("dt");
    term.textContent = label;
    const detail: HTMLElement = document.createElement("dd");
    detail.textContent = value;
    entry.append(term, detail);
    gameInfo.append(entry);
  }

  return gameInfo;
};
