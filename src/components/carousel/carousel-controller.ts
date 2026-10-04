import type { GameCardData } from "../game-card";
import { createCarouselAutoplay } from "./carousel-autoplay";
import { createCarouselCards } from "./carousel-card-items";
import { createCarouselNavigation } from "./carousel-navigation";
import { setupCarouselSwipe } from "./carousel-swipe-controller";

export interface CarouselControls {
  track: HTMLElement;
  games: readonly GameCardData[];
  openGameDetails: (gameSlug: string) => void;
  previousButton: HTMLButtonElement;
  nextButton: HTMLButtonElement;
}

export const setupCarouselController = ({
  track,
  games,
  openGameDetails,
  previousButton,
  nextButton,
}: CarouselControls): void => {
  const cards: HTMLElement[] = createCarouselCards(games, openGameDetails);
  const navigation = createCarouselNavigation(track, cards);
  const autoplay = createCarouselAutoplay(track, (): void => {
    void navigation.move("next");
  });

  previousButton.addEventListener("click", (): void => {
    void navigation.move("previous", autoplay.reset);
  });
  nextButton.addEventListener("click", (): void => {
    void navigation.move("next", autoplay.reset);
  });

  setupCarouselSwipe({
    track,
    autoplay,
    onSwipe: (direction): void => {
      void navigation.move(direction, autoplay.reset);
    },
  });

  globalThis.requestAnimationFrame((): void => autoplay.start());
};
