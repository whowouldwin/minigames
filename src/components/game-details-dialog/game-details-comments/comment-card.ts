import favoriteFilledIcon from "../../../assets/icons/favorite-filled.svg";
import favoriteOutlineIcon from "../../../assets/icons/favorite-outline.svg";
import type { GameComment } from "./comment-data";
import { createCommentAvatar } from "./comment-avatar";

export interface GameDetailsCommentCard {
  element: HTMLLIElement;
  resetLike: () => void;
}

interface LikeButton {
  element: HTMLButtonElement;
  reset: () => void;
}

const createLikeButton = (comment: GameComment): LikeButton => {
  let isLiked: boolean = Boolean(comment.initiallyLiked);

  const button: HTMLButtonElement = document.createElement("button");
  button.className = "game-details-comments__like";
  button.type = "button";

  const icon: HTMLImageElement = document.createElement("img");
  icon.className = "game-details-comments__like-icon";
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");

  const count: HTMLSpanElement = document.createElement("span");
  count.textContent = String(comment.likes);

  const update = (): void => {
    button.classList.toggle("game-details-comments__like--active", isLiked);
    button.setAttribute("aria-pressed", String(isLiked));
    button.setAttribute(
      "aria-label",
      `${isLiked ? "Unlike" : "Like"} comment by ${comment.author}`,
    );
    icon.src = isLiked ? favoriteFilledIcon : favoriteOutlineIcon;
  };

  button.addEventListener("click", (): void => {
    isLiked = !isLiked;
    update();
  });
  button.append(icon, count);
  update();

  return {
    element: button,
    reset: (): void => {
      isLiked = Boolean(comment.initiallyLiked);
      update();
    },
  };
};

const createCommentHeader = (comment: GameComment): HTMLDivElement => {
  const author: HTMLDivElement = document.createElement("div");
  author.className = "game-details-comments__author";
  author.append(
    createCommentAvatar(
      comment.initial,
      "game-details-comments__avatar",
      comment.avatarTone,
    ),
  );

  const authorName: HTMLHeadingElement = document.createElement("h4");
  authorName.className = "game-details-comments__author-name";
  authorName.textContent = comment.author;
  author.append(authorName);

  const date: HTMLSpanElement = document.createElement("span");
  date.className = "game-details-comments__date";
  date.textContent = comment.date;

  const header: HTMLDivElement = document.createElement("div");
  header.className = "game-details-comments__header";
  header.append(author, date);

  return header;
};

const createCommentText = (
  textContent: string,
  className: string,
): HTMLParagraphElement => {
  const text: HTMLParagraphElement = document.createElement("p");
  text.className = className;
  text.textContent = textContent;

  return text;
};

const createCommentFooter = (likeButton: HTMLButtonElement): HTMLDivElement => {
  const footer: HTMLDivElement = document.createElement("div");
  footer.className = "game-details-comments__footer";
  footer.append(likeButton);

  return footer;
};

export const createGameDetailsCommentCard = (
  comment: GameComment,
): GameDetailsCommentCard => {
  const card: HTMLLIElement = document.createElement("li");
  card.className = "game-details-comments__card";

  const article: HTMLElement = document.createElement("article");
  article.className = "game-details-comments__article";
  article.setAttribute("aria-label", `Comment by ${comment.author}`);

  const likeButton: LikeButton = createLikeButton(comment);
  const textClassName = "game-details-comments__text";
  const commentTexts: HTMLParagraphElement[] = [
    createCommentText(
      comment.text,
      comment.compactText
        ? `${textClassName} ${textClassName}--wide-only`
        : textClassName,
    ),
    ...(comment.compactText
      ? [createCommentText(comment.compactText, `${textClassName}--compact`)]
      : []),
  ];

  article.append(
    createCommentHeader(comment),
    ...commentTexts,
    createCommentFooter(likeButton.element),
  );
  card.append(article);

  return { element: card, resetLike: likeButton.reset };
};
