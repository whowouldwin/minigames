import { createGameCard } from "../game-card";

import type { GameCardData } from "../game-card";
import { animateCarouselTransition } from "./carousel-transition";

type Direction = "previous" | "next";

const VISIBLE_CARD_COUNT = 5;
const AUTOPLAY_INTERVAL = 4000;
const SWIPE_DISTANCE = 40;

const wrapIndex = (index: number, length: number): number =>
  (index + length) % length;

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
  const cards: HTMLElement[] = games.map((game): HTMLElement => {
    const card: HTMLElement = createGameCard(game);
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Show details for ${game.title}`);
    card.tabIndex = 0;

    card.addEventListener("click", (): void => openGameDetails(game.slug));
    card.addEventListener("keydown", (event: KeyboardEvent): void => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      card.click();
    });

    return card;
  });

  let firstGameIndex: number = 0;
  let isAnimating: boolean = false;
  let autoplayTimer: number | undefined;
  let autoplayDeadline: number = 0;
  let remainingAutoplayTime: number = AUTOPLAY_INTERVAL;
  let clickSuppressionTimer: number | undefined;
  let isClickSuppressed: boolean = false;

  const renderCards = (firstIndex: number): HTMLElement[] => {
    const visibleCards: HTMLElement[] = [];

    for (let offset: number = 0; offset < VISIBLE_CARD_COUNT; offset += 1) {
      visibleCards.push(cards[wrapIndex(firstIndex + offset, cards.length)]);
    }

    return visibleCards;
  };

  track.replaceChildren(...renderCards(firstGameIndex));

  const clearAutoplay = (): void => {
    if (autoplayTimer === undefined) return;

    globalThis.clearTimeout(autoplayTimer);
    autoplayTimer = undefined;
  };

  const scheduleAutoplay = (delay: number = AUTOPLAY_INTERVAL): void => {
    clearAutoplay();
    if (!track.isConnected) return;

    remainingAutoplayTime = delay;
    autoplayDeadline = performance.now() + delay;
    autoplayTimer = globalThis.setTimeout((): void => {
      autoplayTimer = undefined;
      if (!track.isConnected) return;

      void move("next", false);
      scheduleAutoplay();
    }, delay);
  };

  const pauseAutoplay = (): void => {
    if (autoplayTimer === undefined) return;

    remainingAutoplayTime = Math.max(0, autoplayDeadline - performance.now());
    clearAutoplay();
  };

  const move = async (
    direction: Direction,
    shouldResetAutoplay: boolean = true,
  ): Promise<void> => {
    if (isAnimating) return;

    isAnimating = true;
    if (shouldResetAutoplay) scheduleAutoplay();

    const oldCards: HTMLElement[] = [...track.children].filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
    const offset: number = direction === "next" ? 1 : -1;
    const nextFirstIndex: number = wrapIndex(
      firstGameIndex + offset,
      cards.length,
    );
    const nextCards: HTMLElement[] = renderCards(nextFirstIndex);

    firstGameIndex = nextFirstIndex;
    try {
      await animateCarouselTransition(track, oldCards, nextCards, direction);
    } finally {
      isAnimating = false;
    }
  };

  previousButton.addEventListener("click", (): void => {
    void move("previous");
  });
  nextButton.addEventListener("click", (): void => {
    void move("next");
  });

  track.addEventListener(
    "click",
    (event: MouseEvent): void => {
      if (!isClickSuppressed) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      isClickSuppressed = false;
      if (clickSuppressionTimer === undefined) return;

      globalThis.clearTimeout(clickSuppressionTimer);
      clickSuppressionTimer = undefined;
    },
    { capture: true },
  );

  let pointerStart: { id: number; x: number; y: number } | undefined;

  const finishGesture = (event: PointerEvent, wasCancelled: boolean): void => {
    if (pointerStart?.id !== event.pointerId) return;

    const horizontalDistance: number = event.clientX - pointerStart.x;
    const verticalDistance: number = event.clientY - pointerStart.y;
    pointerStart = undefined;
    globalThis.removeEventListener("pointerup", onPointerUp);
    globalThis.removeEventListener("pointercancel", onPointerCancel);

    if (
      !wasCancelled &&
      Math.abs(horizontalDistance) >= SWIPE_DISTANCE &&
      Math.abs(horizontalDistance) > Math.abs(verticalDistance)
    ) {
      isClickSuppressed = true;
      clickSuppressionTimer = globalThis.setTimeout((): void => {
        isClickSuppressed = false;
        clickSuppressionTimer = undefined;
      }, 0);

      void move(horizontalDistance < 0 ? "next" : "previous");
      return;
    }

    scheduleAutoplay(remainingAutoplayTime);
  };

  const onPointerUp = (event: PointerEvent): void => {
    finishGesture(event, false);
  };

  const onPointerCancel = (event: PointerEvent): void => {
    finishGesture(event, true);
  };

  track.addEventListener("pointerdown", (event: PointerEvent): void => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    pauseAutoplay();
    pointerStart = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    globalThis.addEventListener("pointerup", onPointerUp);
    globalThis.addEventListener("pointercancel", onPointerCancel);
  });

  globalThis.requestAnimationFrame((): void => {
    scheduleAutoplay();
  });
};
