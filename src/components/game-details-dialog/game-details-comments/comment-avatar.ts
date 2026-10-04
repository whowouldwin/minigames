export const createCommentAvatar = (
  initial: string,
  className: string,
): HTMLSpanElement => {
  const avatar: HTMLSpanElement = document.createElement("span");
  avatar.className = className;
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = initial;

  return avatar;
};
