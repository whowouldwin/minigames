import { beforeEach, describe, expect, it, vi } from "vitest";

const { getGameDetails, getGameComments } = vi.hoisted(() => ({
  getGameDetails: vi.fn(),
  getGameComments: vi.fn(),
}));

vi.mock("../src/api", () => ({
  ApiError: class ApiError extends Error {
    constructor(
      message: string,
      readonly status: number,
    ) {
      super(message);
    }
  },
  getErrorMessage: (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback,
  getGameDetails,
  getGameComments,
}));

import { ApiError } from "../src/api";
import { createGameDetailsLoader } from "../src/components/game-details-dialog/game-details-loader";
import { createGameDetailsCommentsLoader } from "../src/components/game-details-dialog/game-details-comments-loader";
import type { GameDetailsComments } from "../src/components/game-details-dialog/game-details-comments";
import type { SnackbarController } from "../src/components/ui/snackbar";

const flush = async (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

describe("game detail request loaders", () => {
  beforeEach(() => {
    getGameDetails.mockReset();
    getGameComments.mockReset();
  });

  it("renders details on success and shows the not-found state for a 404", async () => {
    const content = {
      showLoading: vi.fn(),
      showError: vi.fn(),
      showNotFound: vi.fn(),
      renderGame: vi.fn(),
    };
    const snackbar = { show: vi.fn() } as unknown as SnackbarController;
    getGameDetails.mockResolvedValueOnce({ data: { slug: "cozy" } });
    const loader = createGameDetailsLoader({
      content,
      snackbar,
      isDialogOpen: () => true,
    });
    await loader.load("cozy", "lera@example.com");
    expect(content.showLoading).toHaveBeenCalledOnce();
    expect(content.renderGame).toHaveBeenCalledWith({ slug: "cozy" });
    expect(getGameDetails).toHaveBeenCalledWith(
      "cozy",
      expect.objectContaining({ userEmail: "lera@example.com" }),
    );

    getGameDetails.mockRejectedValueOnce(new ApiError("missing", 404));
    await loader.load("missing");
    expect(content.showNotFound).toHaveBeenCalledOnce();
    expect(content.showError).not.toHaveBeenCalled();
  });

  it("shows recoverable errors, retries, and skips requests for closed dialogs", async () => {
    const content = {
      showLoading: vi.fn(),
      showError: vi.fn(),
      showNotFound: vi.fn(),
      renderGame: vi.fn(),
    };
    const snackbar = { show: vi.fn() } as unknown as SnackbarController;
    getGameDetails
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: { slug: "cozy" } });
    const loader = createGameDetailsLoader({
      content,
      snackbar,
      isDialogOpen: () => true,
    });
    await loader.load("cozy");
    expect(content.showError).toHaveBeenCalledWith(
      "offline",
      expect.any(Function),
    );
    expect(snackbar.show).toHaveBeenCalledWith("offline", "error");
    content.showError.mock.calls[0][1]();
    await flush();
    expect(content.renderGame).toHaveBeenCalledWith({ slug: "cozy" });

    const closed = createGameDetailsLoader({
      content,
      snackbar,
      isDialogOpen: () => false,
    });
    await closed.load("cozy");
    expect(getGameDetails).toHaveBeenCalledTimes(2);
  });

  it("renders comments with server totals and exposes retry after a failure", async () => {
    const comments = {
      element: document.createElement("section"),
      setComposer: vi.fn(),
      showLoading: vi.fn(),
      showError: vi.fn(),
      showEmpty: vi.fn(),
      render: vi.fn(),
    } satisfies GameDetailsComments;
    const snackbar = { show: vi.fn() } as unknown as SnackbarController;
    getGameComments.mockResolvedValueOnce({
      data: [{ commentId: "c1" }],
      meta: { totalComments: 4 },
    });
    const loader = createGameDetailsCommentsLoader({
      comments,
      snackbar,
      isDialogOpen: () => true,
    });
    await loader.load("cozy", "lera@example.com");
    expect(comments.render).toHaveBeenCalledWith([{ commentId: "c1" }], 4);

    getGameComments.mockResolvedValueOnce({ data: [], meta: {} });
    await loader.load("cozy");
    expect(comments.showError).toHaveBeenCalledWith(
      expect.stringContaining("invalid comments"),
      expect.any(Function),
    );
    expect(snackbar.show).toHaveBeenCalledWith(
      expect.stringContaining("invalid comments"),
      "error",
    );
  });
});
