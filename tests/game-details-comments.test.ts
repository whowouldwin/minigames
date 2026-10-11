import { describe, expect, it, vi } from "vitest";
import { createGameDetailsComments } from "../src/components/game-details-dialog/game-details-comments";
import { createGameDetailsCommentCard } from "../src/components/game-details-dialog/game-details-comments/comment-card";
import type { GameComment } from "../src/api/types";
import type { SnackbarController } from "../src/components/ui/snackbar";

const comment: GameComment = {
  commentId: "c1",
  authorName: "Lera Example",
  text: "A useful review",
  likesCount: 3,
  isLikedByCurrentUser: false,
  createdAt: "2026-10-10T12:00:00.000Z",
};

describe("game comments display and state", () => {
  it("updates loading, error, empty, and populated comments states", () => {
    const snackbar = { show: vi.fn() } as unknown as SnackbarController;
    const comments = createGameDetailsComments({
      getActiveSession: () => {},
      canContinueWithSession: () => false,
      snackbar,
    });
    expect(comments.element.getAttribute("aria-busy")).toBe("true");
    comments.showError("Could not load", vi.fn());
    expect(
      comments.element.querySelector('[role="alert"]')?.textContent,
    ).toContain("Could not load");
    comments.showEmpty();
    expect(comments.element.textContent).toContain("No comments yet.");
    comments.render([comment], 8);
    expect(comments.element.querySelector("h3")?.textContent).toBe(
      "Comments (8)",
    );
    expect(
      comments.element.querySelector(".game-details-comments__text")
        ?.textContent,
    ).toBe("A useful review");
  });

  it("renders author identity and delegates guest likes through the guard", () => {
    const canContinueWithSession = vi.fn(() => false);
    const card = createGameDetailsCommentCard(comment, {
      getAvatarColor: () => 1,
      getActiveSession: () => {},
      canContinueWithSession,
      snackbar: { show: vi.fn() } as unknown as SnackbarController,
    });
    expect(card.querySelector("article")?.getAttribute("aria-label")).toBe(
      "Comment by Lera Example",
    );
    expect(
      card.querySelector(".game-details-comments__avatar")?.textContent,
    ).toBe("L");
    expect(card.querySelector("time")?.getAttribute("datetime")).toBe(
      comment.createdAt,
    );
    card
      .querySelector<HTMLButtonElement>(".game-details-comments__likes")
      ?.click();
    expect(canContinueWithSession).toHaveBeenCalledWith(
      "Sign in to like comments.",
    );
  });
});
