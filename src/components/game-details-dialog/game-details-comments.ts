import { createGameDetailsCommentCard } from "./game-details-comments/comment-card";
import type { GameDetailsCommentCard } from "./game-details-comments/comment-card";
import { createGameDetailsCommentForm } from "./game-details-comments/comment-form";
import { gameDetailsComments } from "./game-details-comments/comment-data";
import "./game-details-comments.scss";

interface GameDetailsComments {
  element: HTMLElement;
  reset: () => void;
}

interface CommentsList {
  element: HTMLUListElement;
  cards: GameDetailsCommentCard[];
}

const createCommentsList = (): CommentsList => {
  const list: HTMLUListElement = document.createElement("ul");
  list.className = "game-details-comments__list";
  const cards: GameDetailsCommentCard[] = [];

  for (const comment of gameDetailsComments) {
    const card: GameDetailsCommentCard = createGameDetailsCommentCard(comment);
    cards.push(card);
    list.append(card.element);
  }

  return { element: list, cards };
};

export const createGameDetailsComments = (): GameDetailsComments => {
  const section: HTMLElement = document.createElement("section");
  section.className = "game-details-comments";
  section.setAttribute("aria-labelledby", "game-details-comments-title");

  const heading: HTMLHeadingElement = document.createElement("h3");
  heading.className = "game-details-comments__title";
  heading.id = "game-details-comments-title";
  heading.textContent = `Comments (${gameDetailsComments.length})`;

  const commentForm = createGameDetailsCommentForm();
  const commentList = createCommentsList();
  section.append(heading, commentForm.element, commentList.element);

  return {
    element: section,
    reset: (): void => {
      commentForm.reset();

      for (const comment of commentList.cards) {
        comment.resetLike();
      }
    },
  };
};
