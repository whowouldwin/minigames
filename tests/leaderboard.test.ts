import { beforeEach, describe, expect, it, vi } from "vitest";

const { getLeaderboard } = vi.hoisted(() => ({ getLeaderboard: vi.fn() }));
vi.mock("../src/api", () => ({
  getErrorMessage: (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback,
  getLeaderboard,
}));

import { createLeaderboard } from "../src/components/leaderboard/leaderboard";
import { createPlayerRow } from "../src/components/leaderboard/leaderboard-rows";
import type { LeaderboardPlayer } from "../src/api/types";
import type { SnackbarController } from "../src/components/ui/snackbar";

const player: LeaderboardPlayer = {
  rank: 1,
  playerName: "Lera Example",
  gamesPlayed: 30,
  totalScore: 12_800,
  streakDays: 5,
  favoriteGameSlug: "cozy",
  favoriteGameName: "Cozy Game",
};

describe("leaderboard behavior", () => {
  beforeEach(() => getLeaderboard.mockReset());

  it("formats player rows and renders the loaded leaderboard", async () => {
    expect(createPlayerRow(player).textContent).toContain("12,800");
    expect(createPlayerRow(player).textContent).toContain("LE");
    getLeaderboard.mockResolvedValue({ data: [player] });
    const leaderboard = createLeaderboard({
      show: vi.fn(),
    } as unknown as SnackbarController);
    document.body.append(leaderboard);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(leaderboard.querySelectorAll(":scope tbody tr")).toHaveLength(1);
    expect(leaderboard.textContent).toContain("Cozy Game");
  });

  it("shows empty and retryable error states", async () => {
    const snackbar = { show: vi.fn() } as unknown as SnackbarController;
    getLeaderboard
      .mockResolvedValueOnce({ data: [] })
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: [player] });
    const empty = createLeaderboard(snackbar);
    document.body.append(empty);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(empty.textContent).toContain(
      "No leaderboard players are available yet.",
    );

    const retryable = createLeaderboard(snackbar);
    document.body.append(retryable);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(retryable.querySelector('[role="alert"]')?.textContent).toContain(
      "offline",
    );
    retryable
      .querySelector<HTMLButtonElement>(".request-feedback__retry")!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(retryable.textContent).toContain("Lera Example");
    expect(snackbar.show).toHaveBeenCalledWith(
      "The leaderboard could not be loaded.",
      "error",
    );
  });
});
