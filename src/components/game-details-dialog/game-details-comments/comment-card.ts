import type { GameComment } from "../../../api";
import favoriteFilledIcon from "../../../assets/icons/favorite-filled.svg";
import favoriteOutlineIcon from "../../../assets/icons/favorite-outline.svg";
import { createCommentAvatar } from "./comment-avatar";
import { formatCommentRelativeTime } from "./comment-relative-time";

const getAuthorInitial = (authorName: string): string => {
  const firstLetter: string = authorName.trim().charAt(0);

  return firstLetter ? firstLetter.toUpperCase() : "?";
};

const createCommentHeader = (comment: GameComment): HTMLDivElement => {
  const author: HTMLDivElement = document.createElement("div");
  author.className = "game-details-comments__author";
  author.append(
    createCommentAvatar(
      getAuthorInitial(comment.authorName),
      "game-details-comments__avatar",
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

const createCommentLikes = (comment: GameComment): HTMLSpanElement => {
  const likes: HTMLSpanElement = document.createElement("span");
  likes.className = "game-details-comments__likes";
  likes.setAttribute("aria-label", `${comment.likesCount} likes`);

  if (comment.isLikedByCurrentUser) {
    likes.classList.add("game-details-comments__likes--active");
  }

  const icon: HTMLImageElement = document.createElement("img");
  icon.className = "game-details-comments__likes-icon";
  icon.src = comment.isLikedByCurrentUser
    ? favoriteFilledIcon
    : favoriteOutlineIcon;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");

  const count: HTMLSpanElement = document.createElement("span");
  count.textContent = String(comment.likesCount);
  likes.append(icon, count);

  return likes;
};

export const createGameDetailsCommentCard = (
  comment: GameComment,
): HTMLLIElement => {
  const card: HTMLLIElement = document.createElement("li");
  card.className = "game-details-comments__card";
  card.dataset.commentId = comment.commentId;

  const article: HTMLElement = document.createElement("article");
  article.className = "game-details-comments__article";
  article.setAttribute("aria-label", `Comment by ${comment.authorName}`);

  const footer: HTMLDivElement = document.createElement("div");
  footer.className = "game-details-comments__footer";
  footer.append(createCommentLikes(comment));

  article.append(
    createCommentHeader(comment),
    createCommentText(comment.text),
    footer,
  );
  card.append(article);

  return card;
};
