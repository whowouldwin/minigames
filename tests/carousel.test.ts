import { beforeEach, describe, expect, it, vi } from "vitest";

const { getFeaturedGames, setupCarouselController } = vi.hoisted(() => ({
  getFeaturedGames: vi.fn(),
  setupCarouselController: vi.fn(),
}));
vi.mock("../src/api", () => ({
  appAssetUrl: (path: string): string => `https://assets.example/${path}`,
  getErrorMessage: (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback,
  getFeaturedGames,
}));
vi.mock("../src/components/carousel/carousel-controller", () => ({
  setupCarouselController,
}));

import { createCarousel } from "../src/components/carousel/carousel";
import type { SnackbarController } from "../src/components/ui/snackbar";

const game = {
  slug: "cozy",
  name: "Cozy Game",
  category: "puzzle",
  price: "Free",
  shortDescription: "Relaxing",
  rating: 4.8,
  likesCount: 1250,
  cardImage: "/cozy.jpg",
};
const snackbar = { show: vi.fn() } as unknown as SnackbarController;

describe("featured games carousel", () => {
  beforeEach(() => {
    getFeaturedGames.mockReset();
    setupCarouselController.mockReset();
    snackbar.show = vi.fn();
  });

  it("loads featured games and passes formatted card data to the controller", async () => {
    getFeaturedGames.mockResolvedValue({ data: [game] });
    const carousel = createCarousel(vi.fn(), snackbar);
    document.body.append(carousel);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(carousel.querySelector("h2")?.textContent).toBe("New Games");
    expect(setupCarouselController).toHaveBeenCalledWith(
      expect.objectContaining({
        games: [
          {
            slug: "cozy",
            title: "Cozy Game",
            image: "https://assets.example//cozy.jpg",
            rating: "4.8",
            likes: "1.3K",
          },
        ],
        openGameDetails: expect.any(Function),
      }),
    );
  });

  it("shows the empty state and lets the user retry a failed request", async () => {
    getFeaturedGames
      .mockResolvedValueOnce({ data: [] })
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: [game] });
    const empty = createCarousel(vi.fn(), snackbar);
    document.body.append(empty);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(empty.textContent).toContain("No featured games are available yet.");

    const retryable = createCarousel(vi.fn(), snackbar);
    document.body.append(retryable);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(retryable.querySelector('[role="alert"]')?.textContent).toContain(
      "offline",
    );
    retryable
      .querySelector<HTMLButtonElement>(".request-feedback__retry")!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(setupCarouselController).toHaveBeenCalledOnce();
    expect(snackbar.show).toHaveBeenCalledWith(
      "Featured games could not be loaded.",
      "error",
    );
  });
});
