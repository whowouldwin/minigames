import type { GameComment } from "../../api";
import {
  createEmptyState,
  createErrorState,
  createRequestSkeleton,
} from "../ui/request-feedback";
import { createGameDetailsCommentCard } from "./game-details-comments/comment-card";
import "./game-details-comments.scss";

export interface GameDetailsComments {
  element: HTMLElement;
  setComposer: (composer: HTMLElement) => void;
  showLoading: () => void;
  showError: (message: string, retry: () => void) => void;
  showEmpty: () => void;
  render: (comments: GameComment[], totalComments: number) => void;
}

const createCommentList = (comments: GameComment[]): HTMLUListElement => {
  const list: HTMLUListElement = document.createElement("ul");
  list.className = "game-details-comments__list";

  for (const comment of comments) {
    list.append(createGameDetailsCommentCard(comment));
  }

  return list;
};

export const createGameDetailsComments = (): GameDetailsComments => {
  const section: HTMLElement = document.createElement("section");
  section.className = "game-details-comments";
  section.setAttribute("aria-labelledby", "game-details-comments-title");

  const heading: HTMLHeadingElement = document.createElement("h3");
  heading.className = "game-details-comments__title";
  heading.id = "game-details-comments-title";
  heading.textContent = "Comments";

  const content: HTMLDivElement = document.createElement("div");
  content.className = "game-details-comments__content";

  section.append(heading, content);

  const showLoading = (): void => {
    heading.textContent = "Comments";
    section.setAttribute("aria-busy", "true");

    const skeleton = createRequestSkeleton(
      "Loading recent comments",
      "dialog",
      3,
    );
    skeleton.classList.add("game-details-comments__skeleton");
    content.replaceChildren(skeleton);
  };

  const showError = (message: string, retry: () => void): void => {
    section.setAttribute("aria-busy", "false");
    content.replaceChildren(createErrorState(message, retry));
  };

  const showEmpty = (): void => {
    section.setAttribute("aria-busy", "false");
    content.replaceChildren(createEmptyState("No comments yet."));
  };

  const render = (comments: GameComment[], totalComments: number): void => {
    heading.textContent = `Comments (${totalComments})`;
    section.setAttribute("aria-busy", "false");

    if (comments.length === 0) {
      showEmpty();
      return;
    }

    content.replaceChildren(createCommentList(comments));
  };

  showLoading();

  return {
    element: section,
    setComposer: (form): void => {
      content.before(form);
    },
    showLoading,
    showError,
    showEmpty,
    render,
  };
};
