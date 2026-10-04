import type { CarouselAutoplayController } from "./carousel-autoplay";
import type { CarouselDirection } from "./carousel-navigation";

const SWIPE_DISTANCE = 40;

interface PointerStart {
  id: number;
  x: number;
  y: number;
}

interface CarouselSwipeOptions {
  track: HTMLElement;
  autoplay: CarouselAutoplayController;
  onSwipe: (direction: CarouselDirection) => void;
}

export const setupCarouselSwipe = ({
  track,
  autoplay,
  onSwipe,
}: CarouselSwipeOptions): void => {
  let pointerStart: PointerStart | undefined;
  let clickSuppressionTimer: number | undefined;
  let shouldSuppressClick: boolean = false;

  const clearClickSuppression = (): void => {
    if (clickSuppressionTimer !== undefined) {
      globalThis.clearTimeout(clickSuppressionTimer);
      clickSuppressionTimer = undefined;
    }

    shouldSuppressClick = false;
  };

  track.addEventListener(
    "click",
    (event: MouseEvent): void => {
      if (!shouldSuppressClick) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      clearClickSuppression();
    },
    { capture: true },
  );

  const onPointerUp = (event: PointerEvent): void => {
    finishGesture(event, false);
  };

  const onPointerCancel = (event: PointerEvent): void => {
    finishGesture(event, true);
  };

  const finishGesture = (event: PointerEvent, wasCancelled: boolean): void => {
    if (pointerStart?.id !== event.pointerId) return;

    const horizontalDistance: number = event.clientX - pointerStart.x;
    const verticalDistance: number = event.clientY - pointerStart.y;
    pointerStart = undefined;
    globalThis.removeEventListener("pointerup", onPointerUp);
    globalThis.removeEventListener("pointercancel", onPointerCancel);

    const isHorizontalSwipe: boolean =
      !wasCancelled &&
      Math.abs(horizontalDistance) >= SWIPE_DISTANCE &&
      Math.abs(horizontalDistance) > Math.abs(verticalDistance);

    if (isHorizontalSwipe) {
      shouldSuppressClick = true;
      clickSuppressionTimer = globalThis.setTimeout((): void => {
        clearClickSuppression();
      }, 0);
      onSwipe(horizontalDistance < 0 ? "next" : "previous");
      return;
    }

    autoplay.resume();
  };

  track.addEventListener("pointerdown", (event: PointerEvent): void => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    autoplay.pause();
    pointerStart = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    globalThis.addEventListener("pointerup", onPointerUp);
    globalThis.addEventListener("pointercancel", onPointerCancel);
  });
};
