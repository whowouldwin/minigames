import { ApiError, createGameComment, getErrorMessage } from "../../api";
import type { GameComment } from "../../api";
import type { AppSession } from "../../auth";
import sendIcon from "../../assets/icons/send.svg";
import { createCommentAvatar } from "./game-details-comments/comment-avatar";
import type { SnackbarController } from "../ui/snackbar";
import "./game-details-comment-form.scss";

interface GameDetailsCommentFormOptions {
  getActiveSession: () => AppSession | undefined;
  canContinueWithSession: (message?: string) => boolean;
  snackbar: SnackbarController;
  onCommentCreated: (gameSlug: string, userEmail: string) => Promise<void>;
}

export interface GameDetailsCommentForm {
  element: HTMLFormElement;
  prepareForOpen: (gameSlug: string, session: AppSession | undefined) => void;
}

const getSessionInitial = (displayName: string | undefined): string => {
  const initial: string = displayName?.trim().charAt(0) ?? "";
  return initial ? initial.toUpperCase() : "U";
};

const isDefinitiveRejection = (error: unknown): boolean =>
  error instanceof ApiError &&
  error.status >= 400 &&
  error.status < 500 &&
  error.status !== 408;

const isCreatedComment = (value: unknown): value is GameComment => {
  if (typeof value !== "object" || value === null) return false;

  const comment = value as Record<string, unknown>;
  return (
    typeof comment.commentId === "string" &&
    typeof comment.authorName === "string" &&
    typeof comment.text === "string" &&
    typeof comment.likesCount === "number" &&
    Number.isSafeInteger(comment.likesCount) &&
    comment.likesCount >= 0 &&
    typeof comment.isLikedByCurrentUser === "boolean" &&
    typeof comment.createdAt === "string"
  );
};

export const createGameDetailsCommentForm = ({
  getActiveSession,
  canContinueWithSession,
  snackbar,
  onCommentCreated,
}: GameDetailsCommentFormOptions): GameDetailsCommentForm => {
  const form: HTMLFormElement = document.createElement("form");
  form.className = "game-details-comment-form";
  form.noValidate = true;

  const avatar = createCommentAvatar("U", "game-details-comment-form__avatar");

  const textarea: HTMLTextAreaElement = document.createElement("textarea");
  textarea.className = "game-details-comment-form__textarea";
  textarea.name = "comment";
  textarea.rows = 1;
  textarea.maxLength = 500;
  textarea.placeholder = "Sign in to write a comment.";
  textarea.setAttribute("aria-label", "Write a comment");
  textarea.setAttribute("aria-describedby", "game-details-comment-message");

  const sendButton: HTMLButtonElement = document.createElement("button");
  sendButton.className = "game-details-comment-form__send";
  sendButton.type = "submit";
  sendButton.setAttribute("aria-label", "Send comment");

  const icon: HTMLImageElement = document.createElement("img");
  icon.src = sendIcon;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  sendButton.append(icon);

  const message: HTMLParagraphElement = document.createElement("p");
  message.className = "game-details-comment-form__message";
  message.id = "game-details-comment-message";
  message.setAttribute("aria-live", "polite");
  message.hidden = true;

  form.append(avatar, textarea, sendButton, message);

  let gameSlug: string | undefined;
  let activeSession: AppSession | undefined;
  let isPending = false;
  let hasUnknownOutcome = false;

  const resizeTextarea = (): void => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const setMessage = (text: string, isError = false): void => {
    message.textContent = text;
    message.hidden = !text;
    message.classList.toggle(
      "game-details-comment-form__message--error",
      isError,
    );
    textarea.setAttribute("aria-invalid", String(isError));
  };

  const renderState = (): void => {
    const hasSession: boolean = Boolean(activeSession);
    const isDisabled: boolean = !hasSession || isPending || hasUnknownOutcome;

    form.hidden = !hasSession;
    avatar.textContent = getSessionInitial(activeSession?.displayName);
    textarea.disabled = isDisabled;
    textarea.placeholder = hasSession
      ? "Write a comment..."
      : "Sign in to write a comment.";
    sendButton.disabled = isDisabled || textarea.value.trim().length === 0;
    form.setAttribute("aria-busy", String(isPending));
  };

  const submitComment = async (): Promise<void> => {
    if (isPending || hasUnknownOutcome) return;

    const session = getActiveSession();
    if (!session) {
      activeSession = undefined;
      renderState();
      canContinueWithSession("Sign in to post a comment.");
      return;
    }

    activeSession = session;
    const authorName: string = session.displayName.trim();
    if (authorName.length < 2 || authorName.length > 30) {
      setMessage(
        "Your profile name must be 2–30 characters to post a comment.",
        true,
      );
      renderState();
      return;
    }

    const text: string = textarea.value.trim();
    if (!text || text.length > 500) {
      const isEmpty: boolean = text.length === 0;
      setMessage(
        isEmpty
          ? "Write a comment before sending."
          : "Comments can be up to 500 characters.",
        true,
      );
      textarea.focus();
      renderState();
      return;
    }

    if (!gameSlug) return;
    const submittedGameSlug: string = gameSlug;

    setMessage("");
    isPending = true;
    renderState();

    try {
      const response = await createGameComment(submittedGameSlug, {
        userEmail: session.email,
        authorName,
        text,
      });
      if (!isCreatedComment(response.data)) {
        throw new TypeError(
          "The game server did not confirm the created comment.",
        );
      }
    } catch (error) {
      isPending = false;
      const wasDefinitivelyRejected: boolean = isDefinitiveRejection(error);

      if (wasDefinitivelyRejected) {
        setMessage(
          getErrorMessage(error, "Unable to post this comment."),
          true,
        );
      } else {
        hasUnknownOutcome = true;
        setMessage(
          "The result is unknown. Check the comments before trying again.",
        );
      }

      renderState();
      snackbar.show(
        wasDefinitivelyRejected
          ? getErrorMessage(error, "Unable to post this comment.")
          : "The comment result is unknown. Check the comments before trying again.",
        wasDefinitivelyRejected ? "error" : "warning",
      );
      return;
    }

    textarea.value = "";
    resizeTextarea();
    setMessage("");
    snackbar.show("Comment posted.", "success");

    try {
      await onCommentCreated(submittedGameSlug, session.email);
    } catch {
      snackbar.show(
        "Comment posted, but the comment list could not be refreshed.",
        "warning",
      );
    } finally {
      isPending = false;
      renderState();
    }
  };

  textarea.addEventListener("input", (): void => {
    setMessage("");
    resizeTextarea();
    renderState();
  });

  textarea.addEventListener("keydown", (event: KeyboardEvent): void => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    void submitComment();
  });

  form.addEventListener("submit", (event: SubmitEvent): void => {
    event.preventDefault();
    void submitComment();
  });

  renderState();

  return {
    element: form,
    prepareForOpen: (slug, session): void => {
      gameSlug = slug;
      activeSession = session;
      if (!isPending) {
        textarea.value = "";
        hasUnknownOutcome = false;
        setMessage("");
        resizeTextarea();
      }
      renderState();
    },
  };
};
