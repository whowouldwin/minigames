const AUTOPLAY_INTERVAL = 4000;

export interface CarouselAutoplayController {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export const createCarouselAutoplay = (
  track: HTMLElement,
  advance: () => void,
): CarouselAutoplayController => {
  let timer: number | undefined;
  let deadline: number = 0;
  let remainingTime: number = AUTOPLAY_INTERVAL;

  const clearTimer = (): void => {
    if (timer === undefined) return;

    globalThis.clearTimeout(timer);
    timer = undefined;
  };

  const schedule = (delay: number): void => {
    clearTimer();
    if (!track.isConnected) return;

    remainingTime = delay;
    deadline = performance.now() + delay;
    timer = globalThis.setTimeout((): void => {
      timer = undefined;
      if (!track.isConnected) return;

      advance();
      schedule(AUTOPLAY_INTERVAL);
    }, delay);
  };

  return {
    start: (): void => schedule(AUTOPLAY_INTERVAL),
    pause: (): void => {
      if (timer === undefined) return;

      remainingTime = Math.max(0, deadline - performance.now());
      clearTimer();
    },
    resume: (): void => schedule(remainingTime),
    reset: (): void => schedule(AUTOPLAY_INTERVAL),
  };
};
