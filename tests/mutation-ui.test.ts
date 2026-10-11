import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppSession } from "../src/auth/app-session";
import type { GameComment } from "../src/api/types";
import type { SnackbarController } from "../src/components/ui/snackbar";
import { createDeferred } from "./helpers/deferred";

const { createGameComment, toggleCommentLike, toggleGameFavorite } = vi.hoisted(
  () => ({
    createGameComment: vi.fn(),
    toggleCommentLike: vi.fn(),
    toggleGameFavorite: vi.fn(),
  }),
);

vi.mock("../src/api", () => ({
  ApiError: class extends Error {
    constructor(
      message: string,
      readonly status: number,
    ) {
      super(message);
    }
  },
  createGameComment,
  getErrorMessage: (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback,
  toggleCommentLike,
  toggleGameFavorite,
}));

import { ApiError } from "../src/api";
import { createGameDetailsCommentForm } from "../src/components/game-details-dialog/game-details-comment-form";
import { createGameDetailsFavorite } from "../src/components/game-details-dialog/game-details-favorite";
import { createCommentLikeButton } from "../src/components/game-details-dialog/game-details-comments/comment-like-button";

const session: AppSession = {
  displayName: "Lera",
  email: "lera@example.com",
  authenticatedAt: 1,
};

const comment: GameComment = {
  commentId: "comment-1",
  authorName: "Lera",
  text: "Nice game",
  likesCount: 2,
  isLikedByCurrentUser: false,
  createdAt: "2026-10-10T12:00:00.000Z",
};

const createSnackbar = (): SnackbarController =>
  ({ show: vi.fn() }) as unknown as SnackbarController;

const flushAsyncWork = async (): Promise<void> => {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
};

const submitForm = (form: HTMLFormElement): void => {
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
};

const enterComment = (textarea: HTMLTextAreaElement, text: string): void => {
  textarea.value = text;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
};

describe("favorite controls", () => {
  beforeEach(() => {
    toggleGameFavorite.mockReset();
  });

  it("routes guests to sign-in without sending a favorite request", () => {
    const canContinue = vi.fn(() => false);
    const snackbar = createSnackbar();
    const updateLikesCount = vi.fn();
    const button = createGameDetailsFavorite({
      gameSlug: "cozy-game",
      isFavorited: false,
      likesCount: 3,
      getActiveSession: () => {},
      canContinueWithSession: canContinue,
      snackbar,
      updateLikesCount,
    });

    button.click();

    expect(canContinue).toHaveBeenCalledWith(
      "Sign in to add or remove games from Favorites.",
    );
    expect(toggleGameFavorite).not.toHaveBeenCalled();
    expect(updateLikesCount).toHaveBeenLastCalledWith(3);
  });

  it("updates favorite state only after the server confirms it", async () => {
    const { promise, resolve: resolveRequest } = createDeferred<unknown>();
    toggleGameFavorite.mockImplementation(() => promise);
    const snackbar = createSnackbar();
    const updateLikesCount = vi.fn();
    const button = createGameDetailsFavorite({
      gameSlug: "cozy-game",
      isFavorited: false,
      likesCount: 3,
      getActiveSession: () => session,
      canContinueWithSession: vi.fn(),
      snackbar,
      updateLikesCount,
    });

    button.click();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    resolveRequest({ data: { isFavorited: true, likesCount: 4 } });
    await flushAsyncWork();

    expect(button.disabled).toBe(false);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(updateLikesCount).toHaveBeenLastCalledWith(4);
    expect(snackbar.show).toHaveBeenCalledWith(
      "Game added to Favorites.",
      "success",
    );
  });

  it("keeps retry available after a definitive server rejection", async () => {
    toggleGameFavorite.mockRejectedValue(new ApiError("Try again later.", 403));
    const snackbar = createSnackbar();
    const button = createGameDetailsFavorite({
      gameSlug: "cozy-game",
      isFavorited: false,
      likesCount: 3,
      getActiveSession: () => session,
      canContinueWithSession: vi.fn(),
      snackbar,
      updateLikesCount: vi.fn(),
    });

    button.click();
    await flushAsyncWork();

    expect(button.disabled).toBe(false);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(snackbar.show).toHaveBeenCalledWith("Try again later.", "error");
  });

  it("locks retries after an unknown network outcome", async () => {
    toggleGameFavorite.mockRejectedValue(new Error("Network disconnected"));
    const snackbar = createSnackbar();
    const button = createGameDetailsFavorite({
      gameSlug: "cozy-game",
      isFavorited: false,
      likesCount: 3,
      getActiveSession: () => session,
      canContinueWithSession: vi.fn(),
      snackbar,
      updateLikesCount: vi.fn(),
    });

    button.click();
    await flushAsyncWork();
    button.click();

    expect(button.disabled).toBe(true);
    expect(toggleGameFavorite).toHaveBeenCalledOnce();
    expect(snackbar.show).toHaveBeenCalledWith(
      "The favorite update result is unknown. Reopen game details to check before trying again.",
      "warning",
    );
  });
});

describe("comment like controls", () => {
  beforeEach(() => {
    toggleCommentLike.mockReset();
  });

  it("opens sign-in for guests and displays the initial like count", () => {
    const canContinue = vi.fn();
    const button = createCommentLikeButton({
      comment,
      getActiveSession: () => {},
      canContinueWithSession: canContinue,
      snackbar: createSnackbar(),
    });

    button.click();

    expect(canContinue).toHaveBeenCalledWith("Sign in to like comments.");
    expect(button.textContent).toBe("2");
    expect(toggleCommentLike).not.toHaveBeenCalled();
  });

  it("applies the confirmed liked state and count", async () => {
    toggleCommentLike.mockResolvedValue({
      data: { isLikedByCurrentUser: true, likesCount: 3 },
    });
    const snackbar = createSnackbar();
    const button = createCommentLikeButton({
      comment,
      getActiveSession: () => session,
      canContinueWithSession: vi.fn(),
      snackbar,
    });

    button.click();
    expect(button.disabled).toBe(true);
    await flushAsyncWork();

    expect(toggleCommentLike).toHaveBeenCalledWith("comment-1", session.email);
    expect(button.disabled).toBe(false);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.textContent).toBe("3");
    expect(snackbar.show).toHaveBeenCalledWith("Comment liked.", "success");
  });

  it("allows retry after a definitive rejection", async () => {
    toggleCommentLike.mockRejectedValue(new ApiError("Not allowed.", 403));
    const snackbar = createSnackbar();
    const button = createCommentLikeButton({
      comment,
      getActiveSession: () => session,
      canContinueWithSession: vi.fn(),
      snackbar,
    });

    button.click();
    await flushAsyncWork();

    expect(button.disabled).toBe(false);
    expect(snackbar.show).toHaveBeenCalledWith("Not allowed.", "error");
  });

  it("prevents retry after an ambiguous result", async () => {
    toggleCommentLike.mockRejectedValue(new Error("Connection lost"));
    const snackbar = createSnackbar();
    const button = createCommentLikeButton({
      comment,
      getActiveSession: () => session,
      canContinueWithSession: vi.fn(),
      snackbar,
    });

    button.click();
    await flushAsyncWork();
    button.click();

    expect(button.disabled).toBe(true);
    expect(toggleCommentLike).toHaveBeenCalledOnce();
    expect(snackbar.show).toHaveBeenCalledWith(
      "Like result unknown. Reopen game details to check before retrying.",
      "warning",
    );
  });
});

describe("comment submission", () => {
  let snackbar: SnackbarController;
  let onCommentCreated: ReturnType<typeof vi.fn>;
  let canContinue: ReturnType<typeof vi.fn>;
  let currentSession: AppSession | undefined;
  let form: ReturnType<typeof createGameDetailsCommentForm>;
  let textarea: HTMLTextAreaElement;
  let sendButton: HTMLButtonElement;

  beforeEach(() => {
    createGameComment.mockReset();
    snackbar = createSnackbar();
    onCommentCreated = vi.fn().mockResolvedValue(undefined);
    canContinue = vi.fn();
    currentSession = session;
    form = createGameDetailsCommentForm({
      getActiveSession: () => currentSession,
      canContinueWithSession: canContinue as (message?: string) => boolean,
      snackbar,
      onCommentCreated: onCommentCreated as (
        gameSlug: string,
        userEmail: string,
      ) => Promise<void>,
    });
    textarea = form.element.querySelector("textarea") as HTMLTextAreaElement;
    sendButton = form.element.querySelector("button") as HTMLButtonElement;
    form.prepareForOpen("cozy-game", session);
  });

  afterEach(() => {
    form.element.remove();
  });

  it("hides the form for guests and asks them to sign in when submitting", () => {
    currentSession = undefined;
    form.prepareForOpen("cozy-game", undefined);

    expect(form.element.hidden).toBe(true);
    submitForm(form.element);

    expect(canContinue).toHaveBeenCalledWith("Sign in to post a comment.");
    expect(createGameComment).not.toHaveBeenCalled();
  });

  it("rejects short profile names before making a request", () => {
    currentSession = { ...session, displayName: "L" };
    form.prepareForOpen("cozy-game", currentSession);
    enterComment(textarea, "Hello");
    submitForm(form.element);

    expect(form.element.textContent).toContain(
      "Your profile name must be 2–30 characters to post a comment.",
    );
    expect(createGameComment).not.toHaveBeenCalled();
  });

  it("requires non-empty comment text", () => {
    submitForm(form.element);

    expect(form.element.textContent).toContain(
      "Write a comment before sending.",
    );
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(createGameComment).not.toHaveBeenCalled();
  });

  it("sends trimmed text and refreshes comments after success", async () => {
    const createdComment: GameComment = {
      commentId: "comment-2",
      authorName: "Lera",
      text: "Hello",
      likesCount: 0,
      isLikedByCurrentUser: false,
      createdAt: "2026-10-11T12:00:00.000Z",
    };
    createGameComment.mockResolvedValue({ data: createdComment });
    enterComment(textarea, "  Hello  ");
    submitForm(form.element);

    expect(sendButton.disabled).toBe(true);
    await flushAsyncWork();

    expect(createGameComment).toHaveBeenCalledWith("cozy-game", {
      userEmail: session.email,
      authorName: "Lera",
      text: "Hello",
    });
    expect(textarea.value).toBe("");
    expect(onCommentCreated).toHaveBeenCalledWith("cozy-game", session.email);
    expect(snackbar.show).toHaveBeenCalledWith("Comment posted.", "success");
    expect(sendButton.disabled).toBe(true);
  });

  it("keeps a rejected comment editable for a retry", async () => {
    createGameComment.mockRejectedValue(new ApiError("Text rejected.", 422));
    enterComment(textarea, "Hello");
    submitForm(form.element);
    await flushAsyncWork();

    expect(form.element.textContent).toContain("Text rejected.");
    expect(textarea.value).toBe("Hello");
    expect(sendButton.disabled).toBe(false);
    expect(snackbar.show).toHaveBeenCalledWith("Text rejected.", "error");
  });

  it("locks retries when the server cannot confirm a comment result", async () => {
    createGameComment.mockRejectedValue(new Error("Network disconnected"));
    enterComment(textarea, "Hello");
    submitForm(form.element);
    await flushAsyncWork();
    enterComment(textarea, "Try again");
    submitForm(form.element);

    expect(sendButton.disabled).toBe(true);
    expect(createGameComment).toHaveBeenCalledOnce();
    expect(snackbar.show).toHaveBeenCalledWith(
      "The comment result is unknown. Check the comments before trying again.",
      "warning",
    );
  });

  it("reports a successful post when refreshing the list fails", async () => {
    createGameComment.mockResolvedValue({
      data: {
        commentId: "comment-2",
        authorName: "Lera",
        text: "Hello",
        likesCount: 0,
        isLikedByCurrentUser: false,
        createdAt: "2026-10-11T12:00:00.000Z",
      } satisfies GameComment,
    });
    onCommentCreated.mockRejectedValue(new Error("Refresh failed"));
    enterComment(textarea, "Hello");
    submitForm(form.element);
    await flushAsyncWork();

    expect(snackbar.show).toHaveBeenCalledWith("Comment posted.", "success");
    expect(snackbar.show).toHaveBeenCalledWith(
      "Comment posted, but the comment list could not be refreshed.",
      "warning",
    );
  });
});
