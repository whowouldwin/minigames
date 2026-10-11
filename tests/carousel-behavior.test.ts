import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/components/carousel/carousel-transition", () => ({
  animateCarouselTransition: vi.fn(async (track, _current, next) => {
    track.replaceChildren(...next);
  }),
}));

import { createCarouselAutoplay } from "../src/components/carousel/carousel-autoplay";
import { createCarouselNavigation } from "../src/components/carousel/carousel-navigation";
import { setupCarouselSwipe } from "../src/components/carousel/carousel-swipe-controller";
import type { CarouselAutoplayController } from "../src/components/carousel/carousel-autoplay";
import { createDeferred } from "./helpers/deferred";

afterEach(() => vi.useRealTimers());

describe("carousel interaction behavior", () => {
  it("wraps navigation and ignores another move while a transition is pending", async () => {
    const track = document.createElement("div");
    const cards = Array.from({ length: 6 }, () =>
      document.createElement("article"),
    );
    const { promise, resolve: finish } = createDeferred<void>();
    const transition =
      await import("../src/components/carousel/carousel-transition");
    vi.mocked(transition.animateCarouselTransition).mockImplementationOnce(
      () => promise,
    );
    const navigation = createCarouselNavigation(track, cards);
    expect([...track.children]).toEqual(cards.slice(0, 5));

    const moving = navigation.move("previous");
    await navigation.move("next");
    expect([...track.children]).toEqual([cards[5], ...cards.slice(0, 4)]);
    finish();
    await moving;
    await navigation.move("next");
    expect([...track.children]).toEqual(cards.slice(0, 5));
  });

  it("pauses, resumes with remaining time, and advances while connected", () => {
    vi.useFakeTimers();
    const track = document.createElement("div");
    document.body.append(track);
    const advance = vi.fn();
    const autoplay = createCarouselAutoplay(track, advance);
    autoplay.start();
    vi.advanceTimersByTime(1500);
    autoplay.pause();
    vi.advanceTimersByTime(5000);
    expect(advance).not.toHaveBeenCalled();
    autoplay.resume();
    vi.advanceTimersByTime(2499);
    expect(advance).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(advance).toHaveBeenCalledOnce();
    autoplay.reset();
    track.remove();
    vi.advanceTimersByTime(4000);
    expect(advance).toHaveBeenCalledOnce();
  });

  it("moves on horizontal swipes, suppresses the synthetic click, and resumes on cancel", () => {
    vi.useFakeTimers();
    const track = document.createElement("div");
    const autoplay: CarouselAutoplayController = {
      pause: vi.fn(),
      resume: vi.fn(),
      start: vi.fn(),
      reset: vi.fn(),
    };
    const onSwipe = vi.fn();
    const cardClick = vi.fn();
    track.addEventListener("click", cardClick);
    setupCarouselSwipe({ track, autoplay, onSwipe });

    track.dispatchEvent(
      new PointerEvent("pointerdown", {
        pointerId: 1,
        pointerType: "touch",
        clientX: 100,
        clientY: 20,
      }),
    );
    globalThis.dispatchEvent(
      new PointerEvent("pointerup", {
        pointerId: 1,
        pointerType: "touch",
        clientX: 40,
        clientY: 22,
      }),
    );
    expect(onSwipe).toHaveBeenCalledWith("next");
    track.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    expect(cardClick).not.toHaveBeenCalled();

    track.dispatchEvent(
      new PointerEvent("pointerdown", {
        pointerId: 2,
        pointerType: "touch",
        clientX: 10,
        clientY: 10,
      }),
    );
    globalThis.dispatchEvent(
      new PointerEvent("pointercancel", {
        pointerId: 2,
        pointerType: "touch",
        clientX: 10,
        clientY: 10,
      }),
    );
    expect(autoplay.resume).toHaveBeenCalledOnce();
  });
});
