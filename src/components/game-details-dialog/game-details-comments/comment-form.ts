import sendIcon from "../../../assets/icons/send.svg";
import { createCommentAvatar } from "./comment-avatar";

export interface GameDetailsCommentForm {
  element: HTMLFormElement;
  reset: () => void;
}

const resizeTextarea = (textarea: HTMLTextAreaElement): void => {
  textarea.style.height = "auto";

  const maxHeight: number = Number(
    getComputedStyle(textarea).maxHeight.replace("px", ""),
  );
  const nextHeight: number = Math.min(textarea.scrollHeight, maxHeight);
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY =
    textarea.scrollHeight > maxHeight ? "auto" : "hidden";
};

const createTextarea = (): HTMLTextAreaElement => {
  const textarea: HTMLTextAreaElement = document.createElement("textarea");
  textarea.className = "game-details-comments__textarea";
  textarea.rows = 1;
  textarea.placeholder = "Write a comment...";
  textarea.setAttribute("aria-label", "Write a comment");
  textarea.addEventListener("input", (): void => resizeTextarea(textarea));

  return textarea;
};

const createSubmitButton = (): HTMLButtonElement => {
  const button: HTMLButtonElement = document.createElement("button");
  button.className = "game-details-comments__submit";
  button.type = "submit";
  button.setAttribute("aria-label", "Submit comment");

  const icon: HTMLImageElement = document.createElement("img");
  icon.src = sendIcon;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  button.append(icon);

  return button;
};

export const createGameDetailsCommentForm = (): GameDetailsCommentForm => {
  const form: HTMLFormElement = document.createElement("form");
  form.className = "game-details-comments__form";
  form.setAttribute("aria-label", "Add a comment");
  form.addEventListener("submit", (event: SubmitEvent): void => {
    event.preventDefault();
  });

  const avatar = createCommentAvatar("U", "game-details-comments__form-avatar");
  const textarea: HTMLTextAreaElement = createTextarea();
  form.append(avatar, textarea, createSubmitButton());

  return {
    element: form,
    reset: (): void => {
      form.reset();
      textarea.style.height = "";
      textarea.style.overflowY = "hidden";
      textarea.scrollTop = 0;
    },
  };
};
