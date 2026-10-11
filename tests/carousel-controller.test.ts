import { describe, expect, it, vi } from "vitest";
import { setupCarouselController } from "../src/components/carousel/carousel-controller";

describe("carousel controls", () => {
  it("opens a game card with keyboard and advances through the navigation buttons", async () => {
    vi.spyOn(globalThis, "requestAnimationFrame").mockReturnValue(1);
    const track = document.createElement("div");
    const previousButton = document.createElement("button");
    const nextButton = document.createElement("button");
    const openGameDetails = vi.fn();
    const games = Array.from({ length: 6 }, (_, index) => ({
      slug: `game-${index}`,
      title: `Game ${index}`,
      image: "image.jpg",
      rating: "4.0",
      likes: "2",
    }));
    setupCarouselController({
      track,
      games,
      openGameDetails,
      previousButton,
      nextButton,
    });
    const firstCard = track.firstElementChild as HTMLElement;
    expect(firstCard.getAttribute("role")).toBe("button");
    const keyboard = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    firstCard.dispatchEvent(keyboard);
    expect(keyboard.defaultPrevented).toBe(true);
    expect(openGameDetails).toHaveBeenCalledWith("game-0");

    nextButton.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(track.firstElementChild?.getAttribute("aria-label")).toBe(
      "Show details for Game 1",
    );
    previousButton.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(track.firstElementChild?.getAttribute("aria-label")).toBe(
      "Show details for Game 0",
    );
  });
});
