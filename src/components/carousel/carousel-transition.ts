type Direction = "previous" | "next";

interface CardPosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

const getCardPosition = (card: HTMLElement): CardPosition => {
  const { left, top, width, height } = card.getBoundingClientRect();

  return { left, top, width, height };
};

const getAnimationDuration = (track: HTMLElement): number => {
  const duration: string = getComputedStyle(track)
    .getPropertyValue("--carousel-transition-duration")
    .trim();
  const milliseconds: number = Number(duration.replace("ms", ""));

  return globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : Number.isFinite(milliseconds)
      ? milliseconds
      : 450;
};

const animateCard = async (
  card: HTMLElement,
  from: Keyframe,
  to: Keyframe,
  duration: number,
): Promise<void> => {
  const animation: Animation = card.animate([from, to], {
    duration,
    easing: "ease-in-out",
  });

  try {
    await animation.finished;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    throw error;
  }
};

export const animateCarouselTransition = async (
  track: HTMLElement,
  currentCards: readonly HTMLElement[],
  nextCards: readonly HTMLElement[],
  direction: Direction,
): Promise<void> => {
  const currentPositions: Map<HTMLElement, CardPosition> = new Map(
    currentCards.map((card): [HTMLElement, CardPosition] => [
      card,
      getCardPosition(card),
    ]),
  );

  track.replaceChildren(...nextCards);

  const duration: number = getAnimationDuration(track);
  const animations: Promise<void>[] = [];

  for (const card of nextCards) {
    const nextPosition: CardPosition = getCardPosition(card);
    if (nextPosition.width === 0) continue;

    const currentPosition: CardPosition | undefined =
      currentPositions.get(card);

    if (!currentPosition || currentPosition.width === 0) {
      const startingOffset: string = direction === "next" ? "100%" : "-100%";

      animations.push(
        animateCard(
          card,
          {
            transform: `translateX(${startingOffset}) scaleX(0.65)`,
            opacity: 0,
          },
          { transform: "none", opacity: 1 },
          duration,
        ),
      );
      continue;
    }

    const x: number = currentPosition.left - nextPosition.left;
    const y: number = currentPosition.top - nextPosition.top;
    const scaleX: number = currentPosition.width / nextPosition.width;
    const scaleY: number = currentPosition.height / nextPosition.height;

    if (x === 0 && y === 0 && scaleX === 1 && scaleY === 1) continue;

    animations.push(
      animateCard(
        card,
        { transform: `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})` },
        { transform: "none" },
        duration,
      ),
    );
  }

  await Promise.all(animations);
};
