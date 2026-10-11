import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppSession } from "../src/auth/app-session";

const {
  createGameDetailsContent,
  createGameDetailsCommentsLoader,
  createGameDetailsCommentForm,
  createGameDetailsLoader,
} = vi.hoisted(() => ({
  createGameDetailsContent: vi.fn(),
  createGameDetailsCommentsLoader: vi.fn(),
  createGameDetailsCommentForm: vi.fn(),
  createGameDetailsLoader: vi.fn(),
}));
vi.mock("../src/components/game-details-dialog/game-details-content", () => ({
  createGameDetailsContent,
}));
vi.mock(
  "../src/components/game-details-dialog/game-details-comments-loader",
  () => ({ createGameDetailsCommentsLoader }),
);
vi.mock(
  "../src/components/game-details-dialog/game-details-comment-form",
  () => ({ createGameDetailsCommentForm }),
);
vi.mock("../src/components/game-details-dialog/game-details-loader", () => ({
  createGameDetailsLoader,
}));

import { createGameDetailsDialog } from "../src/components/game-details-dialog/game-details-dialog";
import type { SnackbarController } from "../src/components/ui/snackbar";

const session: AppSession = {
  displayName: "Lera",
  email: "lera@example.com",
  authenticatedAt: 1,
};

describe("game details dialog lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "scrollTo").mockImplementation(() => {});
    const comments = { setComposer: vi.fn() };
    createGameDetailsContent.mockReturnValue({
      hero: document.createElement("header"),
      body: document.createElement("section"),
      comments,
    });
    createGameDetailsCommentsLoader.mockReturnValue({
      load: vi.fn(),
      cancel: vi.fn(),
    });
    createGameDetailsLoader.mockReturnValue({ load: vi.fn(), cancel: vi.fn() });
    createGameDetailsCommentForm.mockReturnValue({
      element: document.createElement("form"),
      prepareForOpen: vi.fn(),
    });
  });

  it("loads game and comments with the active user and restores focus and scroll on close", async () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const onClose = vi.fn();
    const dialog = createGameDetailsDialog(
      { show: vi.fn() } as unknown as SnackbarController,
      onClose,
      () => session,
      () => true,
    );
    document.body.append(dialog.element);
    dialog.open("cozy");
    expect(dialog.element.open).toBe(true);
    expect(
      createGameDetailsCommentForm.mock.results[0]?.value.prepareForOpen,
    ).toHaveBeenCalledWith("cozy", session);
    expect(
      createGameDetailsLoader.mock.results[0]?.value.load,
    ).toHaveBeenCalledWith("cozy", "lera@example.com");
    expect(
      createGameDetailsCommentsLoader.mock.results[0]?.value.load,
    ).toHaveBeenCalledWith("cozy", "lera@example.com");

    await dialog.close();
    expect(dialog.element.open).toBe(false);
    expect(trigger).toBe(document.activeElement);
    expect(
      createGameDetailsLoader.mock.results[0]?.value.cancel,
    ).toHaveBeenCalledOnce();
    expect(
      createGameDetailsCommentsLoader.mock.results[0]?.value.cancel,
    ).toHaveBeenCalledOnce();
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("does not reload the same open game and blocks closing while the close animation is pending", async () => {
    const dialog = createGameDetailsDialog(
      { show: vi.fn() } as unknown as SnackbarController,
      vi.fn(),
      () => {},
      () => false,
    );
    document.body.append(dialog.element);
    dialog.open("cozy");
    dialog.open("cozy");
    expect(
      createGameDetailsLoader.mock.results[0]?.value.load,
    ).toHaveBeenCalledOnce();
    const cancel = new Event("cancel", { cancelable: true });
    dialog.element.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
  });
});
