import { animateCarouselTransition } from "./carousel-transition";

const VISIBLE_CARD_COUNT = 5;

export type CarouselDirection = "previous" | "next";

export interface CarouselNavigationController {
  move: (
    direction: CarouselDirection,
    onMoveStart?: () => void,
  ) => Promise<void>;
}

const wrapIndex = (index: number, length: number): number =>
  (index + length) % length;

export const createCarouselNavigation = (
  track: HTMLElement,
  cards: readonly HTMLElement[],
): CarouselNavigationController => {
  let firstGameIndex: number = 0;
  let isAnimating: boolean = false;

  const getVisibleCards = (firstIndex: number): HTMLElement[] => {
    const visibleCards: HTMLElement[] = [];

    for (let offset: number = 0; offset < VISIBLE_CARD_COUNT; offset += 1) {
      const cardIndex: number = wrapIndex(firstIndex + offset, cards.length);
      visibleCards.push(cards[cardIndex]);
    }

    return visibleCards;
  };

  track.replaceChildren(...getVisibleCards(firstGameIndex));

  const move = async (
    direction: CarouselDirection,
    onMoveStart?: () => void,
  ): Promise<void> => {
    if (isAnimating) return;

    isAnimating = true;
    try {
      onMoveStart?.();

      const currentCards: HTMLElement[] = [...track.children].filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      const step: number = direction === "next" ? 1 : -1;
      const nextFirstIndex: number = wrapIndex(
        firstGameIndex + step,
        cards.length,
      );
      const nextCards: HTMLElement[] = getVisibleCards(nextFirstIndex);

      firstGameIndex = nextFirstIndex;
      await animateCarouselTransition(
        track,
        currentCards,
        nextCards,
        direction,
      );
    } finally {
      isAnimating = false;
    }
  };

  return { move };
};
