import { beforeEach, describe, expect, it, vi } from "vitest";

const { getLibraryGames } = vi.hoisted(() => ({ getLibraryGames: vi.fn() }));
vi.mock("../src/api", () => ({
  appAssetUrl: (path: string): string => `https://assets.example/${path}`,
  getErrorMessage: (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback,
  getLibraryGames,
}));

import { createLibraryGameList } from "../src/components/library-game-list/library-game-list";
import type { SnackbarController } from "../src/components/ui/snackbar";

const query = { category: "puzzle", sort: "name-asc", page: 2 } as const;
const game = {
  slug: "cozy",
  name: "Cozy Game",
  category: "Puzzle",
  price: "Free",
  shortDescription: "A relaxing game",
  rating: 4.8,
  likesCount: 10,
  cardImage: "/cozy.jpg",
};

describe("library game list", () => {
  beforeEach(() => getLibraryGames.mockReset());

  it("renders games, reports pagination, and opens selected details", async () => {
    getLibraryGames.mockResolvedValue({
      data: [game],
      meta: { page: 2, totalPages: 4 },
    });
    const openDetails = vi.fn();
    const onPaginationUpdate = vi.fn();
    const list = createLibraryGameList(
      openDetails,
      { show: vi.fn() } as unknown as SnackbarController,
      onPaginationUpdate,
    );
    document.body.append(list.element);
    await list.load(query);

    expect(onPaginationUpdate).toHaveBeenCalledWith({ page: 2, totalPages: 4 });
    expect(list.element.textContent).toContain("Cozy Game");
    list.element
      .querySelector<HTMLButtonElement>(".library-game-card__details")!
      .click();
    expect(openDetails).toHaveBeenCalledWith("cozy");
  });

  it("shows empty and retryable failure states and ignores malformed pagination", async () => {
    const snackbar = { show: vi.fn() } as unknown as SnackbarController;
    const list = createLibraryGameList(vi.fn(), snackbar, vi.fn());
    document.body.append(list.element);
    getLibraryGames.mockResolvedValueOnce({
      data: [],
      meta: { page: 1, totalPages: 0 },
    });
    await list.load(query);
    expect(list.element.textContent).toContain("Data Not Found");

    getLibraryGames
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({
        data: [game],
        meta: { page: 1, totalPages: 1 },
      });
    await list.load({ ...query, page: 3 });
    expect(list.element.querySelector('[role="alert"]')?.textContent).toContain(
      "offline",
    );
    list.element
      .querySelector<HTMLButtonElement>(".request-feedback__retry")!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(list.element.textContent).toContain("Cozy Game");

    getLibraryGames.mockResolvedValueOnce({
      data: [game],
      meta: { page: 0, totalPages: 1 },
    });
    await list.load({ ...query, page: 4 });
    expect(list.element.querySelector('[role="alert"]')?.textContent).toContain(
      "invalid pagination",
    );
    list.cancel();
  });
});
