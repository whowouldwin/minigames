import type { GameComment } from "../../../api";
import type { AppSession } from "../../../auth";
import type { SnackbarController } from "../../ui/snackbar";
import { createCommentAvatar } from "./comment-avatar";
import type { CommentAvatarColorPicker } from "./comment-avatar";
import { createCommentLikeButton } from "./comment-like-button";
import { formatCommentRelativeTime } from "./comment-relative-time";

interface CommentCardOptions {
  getAvatarColor: CommentAvatarColorPicker;
  getActiveSession: () => AppSession | undefined;
  canContinueWithSession: (message?: string) => boolean;
  snackbar: SnackbarController;
}

const getAuthorInitial = (authorName: string): string => {
  const firstLetter: string = authorName.trim().charAt(0);

  return firstLetter ? firstLetter.toUpperCase() : "?";
};

const createCommentHeader = (
  comment: GameComment,
  getAvatarColor: CommentAvatarColorPicker,
): HTMLDivElement => {
  const author: HTMLDivElement = document.createElement("div");
  author.className = "game-details-comments__author";
  author.append(
    createCommentAvatar(
      getAuthorInitial(comment.authorName),
      "game-details-comments__avatar",
      getAvatarColor(comment.authorName),
    ),
  );

  const authorName: HTMLHeadingElement = document.createElement("h4");
  authorName.className = "game-details-comments__author-name";
  authorName.textContent = comment.authorName;
  author.append(authorName);

  const date: HTMLTimeElement = document.createElement("time");
  date.className = "game-details-comments__date";
  date.dateTime = comment.createdAt;
  date.textContent = formatCommentRelativeTime(comment.createdAt);

  const header: HTMLDivElement = document.createElement("div");
  header.className = "game-details-comments__header";
  header.append(author, date);

  return header;
};

const createCommentText = (text: string): HTMLParagraphElement => {
  const commentText: HTMLParagraphElement = document.createElement("p");
  commentText.className = "game-details-comments__text";
  commentText.textContent = text;

  return commentText;
};

export const createGameDetailsCommentCard = (
  comment: GameComment,
  {
    getAvatarColor,
    getActiveSession,
    canContinueWithSession,
    snackbar,
  }: CommentCardOptions,
): HTMLLIElement => {
  const card: HTMLLIElement = document.createElement("li");
  card.className = "game-details-comments__card";
  card.dataset.commentId = comment.commentId;

  const article: HTMLElement = document.createElement("article");
  article.className = "game-details-comments__article";
  article.setAttribute("aria-label", `Comment by ${comment.authorName}`);

  const footer: HTMLDivElement = document.createElement("div");
  footer.className = "game-details-comments__footer";
  footer.append(
    createCommentLikeButton({
      comment,
      getActiveSession,
      canContinueWithSession,
      snackbar,
    }),
  );

  article.append(
    createCommentHeader(comment, getAvatarColor),
    createCommentText(comment.text),
    footer,
  );
  card.append(article);

  return card;
};
