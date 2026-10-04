import { createGameCard } from "../game-card";
import type { GameCardData } from "../game-card";

export const createCarouselCards = (
  games: readonly GameCardData[],
  openGameDetails: (gameSlug: string) => void,
): HTMLElement[] =>
  games.map((game): HTMLElement => {
    const card: HTMLElement = createGameCard(game);
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Show details for ${game.title}`);
    card.tabIndex = 0;

    card.addEventListener("click", (): void => {
      openGameDetails(game.slug);
    });
    card.addEventListener("keydown", (event: KeyboardEvent): void => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      card.click();
    });

    return card;
  });
