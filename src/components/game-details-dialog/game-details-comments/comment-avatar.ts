import type { CommentAvatarTone } from "./comment-data";

export const createCommentAvatar = (
  initial: string,
  className: string,
  tone?: CommentAvatarTone,
): HTMLSpanElement => {
  const avatar: HTMLSpanElement = document.createElement("span");
  avatar.className = className;
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = initial;

  if (tone) avatar.classList.add(`${className}--${tone}`);

  return avatar;
};
