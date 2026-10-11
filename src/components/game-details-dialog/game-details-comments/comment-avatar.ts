export type CommentAvatarColor = 1 | 2 | 3 | 4 | 5;

export type CommentAvatarColorPicker = (
  authorName: string,
) => CommentAvatarColor;

const avatarColors: CommentAvatarColor[] = [1, 2, 3, 4, 5];

export const createCommentAvatarColorPicker = (): CommentAvatarColorPicker => {
  const colorsByAuthor = new Map<string, CommentAvatarColor>();

  return (authorName): CommentAvatarColor => {
    const key: string = authorName.trim().toLowerCase();
    const existingColor = colorsByAuthor.get(key);
    if (existingColor) return existingColor;

    const randomIndex: number = Math.floor(Math.random() * avatarColors.length);
    const color: CommentAvatarColor = avatarColors[randomIndex];
    colorsByAuthor.set(key, color);

    return color;
  };
};

export const createCommentAvatar = (
  initial: string,
  className: string,
  color?: CommentAvatarColor,
): HTMLSpanElement => {
  const avatar: HTMLSpanElement = document.createElement("span");
  avatar.className = className;
  if (color) avatar.classList.add(`${className}--random-${color}`);
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = initial;

  return avatar;
};
