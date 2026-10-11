import { describe, expect, it, vi } from "vitest";
import { createGameDetailsContent } from "../src/components/game-details-dialog/game-details-content";
import { createGameDetailsHero } from "../src/components/game-details-dialog/game-details-hero";
import { createGameDetailsTopRecords } from "../src/components/game-details-dialog/game-details-top-records";
import type { GameDetails } from "../src/api/types";
import type { SnackbarController } from "../src/components/ui/snackbar";

const game: GameDetails = {
  slug: "cozy",
  name: "Cozy Game",
  heroImage: "/cozy.jpg",
  rating: 4.75,
  likesCount: 1200,
  isLikedByCurrentUser: false,
  fullDescription: "A relaxing puzzle game.",
  specs: { genre: "Puzzle", players: "1-2", duration: "15 min", price: "Free" },
  topRecords: [
    {
      position: 1,
      playerName: "Lera",
      score: 12_000,
      achievedAt: "2026-10-10T12:00:00Z",
    },
  ],
};

describe("game detail presentation states", () => {
  it("switches detail content between loading, error, missing, and loaded game", () => {
    const content = createGameDetailsContent(vi.fn(), {
      getActiveSession: () => {},
      canContinueWithSession: () => false,
      snackbar: { show: vi.fn() } as unknown as SnackbarController,
    });
    expect(content.body.getAttribute("aria-busy")).toBe("true");
    content.showError("offline", vi.fn());
    expect(content.body.textContent).toContain("Game details unavailable");
    content.showNotFound();
    expect(content.body.textContent).toContain("Game Not Found");
    content.renderGame(game);
    expect(content.body.getAttribute("aria-busy")).toBe("false");
    expect(content.body.textContent).toContain("A relaxing puzzle game.");
    expect(content.body.textContent).toContain("12,000 pts");
    expect(content.body.querySelector("dt")?.textContent).toBe("Genre");
  });

  it("shows medal labels and a meaningful empty records message", () => {
    const records = createGameDetailsTopRecords([
      ...game.topRecords,
      {
        position: 2,
        playerName: "Ada",
        score: 9000,
        achievedAt: "2026-10-09T12:00:00Z",
      },
      {
        position: 4,
        playerName: "Max",
        score: 7000,
        achievedAt: "2026-10-08T12:00:00Z",
      },
    ]);
    expect(
      [...records.querySelectorAll(".game-details-records__medal")].map(
        (item) => item.textContent,
      ),
    ).toEqual(["🥇", "🥈", "4"]);
    expect(records.textContent).toContain("12,000 pts");
    expect(createGameDetailsTopRecords([]).textContent).toContain(
      "No top records are available yet.",
    );
  });

  it("manages cover loading and closes from the artwork header", () => {
    const close = vi.fn();
    const hero = createGameDetailsHero(close);
    const cover = hero.element.querySelector<HTMLImageElement>(
      ".game-details-dialog__cover",
    )!;
    const skeleton = hero.element.querySelector<HTMLElement>(
      ".game-details-dialog__hero-skeleton",
    )!;
    hero.showImage(game);
    expect(cover.alt).toBe("Cozy Game game artwork");
    expect(cover.hidden).toBe(true);
    cover.dispatchEvent(new Event("error"));
    expect(skeleton.hidden).toBe(true);
    expect(cover.hidden).toBe(true);
    hero.showLoading();
    expect(skeleton.hidden).toBe(false);
    hero.hideImage();
    expect(
      hero.element.classList.contains("game-details-dialog__hero--feedback"),
    ).toBe(true);
    hero.element
      .querySelector<HTMLButtonElement>(".game-details-dialog__close")!
      .click();
    expect(close).toHaveBeenCalledOnce();
  });
});
