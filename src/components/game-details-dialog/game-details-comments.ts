import favoriteFilledIcon from "../../assets/icons/favorite-filled.svg";
import favoriteOutlineIcon from "../../assets/icons/favorite-outline.svg";
import sendIcon from "../../assets/icons/send.svg";
import "./game-details-comments.scss";

interface GameComment {
  author: string;
  initial: string;
  avatarColor: "blue" | "yellow" | "neutral";
  date: string;
  text: string;
  compactText?: string;
  likes: number;
  initiallyLiked?: boolean;
}

interface CommentCard {
  element: HTMLLIElement;
  resetLike: () => void;
}

interface GameDetailsComments {
  element: HTMLElement;
  reset: () => void;
}

const comments: GameComment[] = [
  {
    author: "ForestDweller",
    initial: "F",
    avatarColor: "blue",
    date: "3 hours ago",
    text: "The hand-drawn art is absolutely magical 🍄 Every location feels like a page from a children's storybook. The mushroom village made me cry happy tears!",
    likes: 12,
  },
  {
    author: "HerbalTeaLover",
    initial: "H",
    avatarColor: "yellow",
    date: "1 day ago",
    text: "Perfect cozy evening game — brew a cup of chamomile, wrap in a blanket and help the little Tukoni prepare for winter. The puzzles are gentle but satisfying.",
    compactText:
      "Great for relaxing after work. Would love to see more tile themes added!",
    likes: 5,
  },
  {
    author: "CottageCoreMia",
    initial: "C",
    avatarColor: "neutral",
    date: "3 days ago",
    text: "I want to live inside this game forever 🌿 The NPCs are so charming, the tea recipes are real, and the atmosphere is pure warmth and calm.",
    likes: 8,
    initiallyLiked: true,
  },
];

const createAvatar = (
  initial: string,
  className: string,
  color?: GameComment["avatarColor"],
): HTMLSpanElement => {
  const avatar: HTMLSpanElement = document.createElement("span");
  avatar.className = className;
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = initial;

  if (color) avatar.classList.add(`${className}--${color}`);

  return avatar;
};

const createLikeButton = (
  comment: GameComment,
): { button: HTMLButtonElement; reset: () => void } => {
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
    button,
    reset: (): void => {
      isLiked = Boolean(comment.initiallyLiked);
      update();
    },
  };
};

const createCommentCard = (comment: GameComment): CommentCard => {
  const card: HTMLLIElement = document.createElement("li");
  card.className = "game-details-comments__card";

  const article: HTMLElement = document.createElement("article");
  article.className = "game-details-comments__article";
  article.setAttribute("aria-label", `Comment by ${comment.author}`);

  const header: HTMLDivElement = document.createElement("div");
  header.className = "game-details-comments__header";

  const author: HTMLDivElement = document.createElement("div");
  author.className = "game-details-comments__author";
  author.append(
    createAvatar(
      comment.initial,
      "game-details-comments__avatar",
      comment.avatarColor,
    ),
  );

  const authorName: HTMLHeadingElement = document.createElement("h4");
  authorName.className = "game-details-comments__author-name";
  authorName.textContent = comment.author;
  author.append(authorName);

  const date: HTMLSpanElement = document.createElement("span");
  date.className = "game-details-comments__date";
  date.textContent = comment.date;
  header.append(author, date);

  const text: HTMLParagraphElement = document.createElement("p");
  text.className = "game-details-comments__text";
  text.textContent = comment.text;
  const commentText: HTMLParagraphElement[] = [text];

  if (comment.compactText) {
    text.classList.add("game-details-comments__text--wide-only");
    const compactText: HTMLParagraphElement = document.createElement("p");
    compactText.className = "game-details-comments__text--compact";
    compactText.textContent = comment.compactText;
    commentText.push(compactText);
  }

  const like = createLikeButton(comment);
  const footer: HTMLDivElement = document.createElement("div");
  footer.className = "game-details-comments__footer";
  footer.append(like.button);

  article.append(header, ...commentText, footer);
  card.append(article);

  return { element: card, resetLike: like.reset };
};

const createCommentForm = (): {
  form: HTMLFormElement;
  textarea: HTMLTextAreaElement;
} => {
  const form: HTMLFormElement = document.createElement("form");
  form.className = "game-details-comments__form";
  form.setAttribute("aria-label", "Add a comment");
  form.addEventListener("submit", (event: SubmitEvent): void => {
    event.preventDefault();
  });

  const avatar = createAvatar("U", "game-details-comments__form-avatar");

  const textarea: HTMLTextAreaElement = document.createElement("textarea");
  textarea.className = "game-details-comments__textarea";
  textarea.rows = 1;
  textarea.placeholder = "Write a comment...";
  textarea.setAttribute("aria-label", "Write a comment");
  textarea.addEventListener("input", (): void => {
    textarea.style.height = "auto";

    const maxHeight: number = Number(
      getComputedStyle(textarea).maxHeight.replace("px", ""),
    );
    const nextHeight: number = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  });

  const submit: HTMLButtonElement = document.createElement("button");
  submit.className = "game-details-comments__submit";
  submit.type = "submit";
  submit.setAttribute("aria-label", "Submit comment");

  const icon: HTMLImageElement = document.createElement("img");
  icon.src = sendIcon;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  submit.append(icon);

  form.append(avatar, textarea, submit);

  return { form, textarea };
};

export const createGameDetailsComments = (): GameDetailsComments => {
  const section: HTMLElement = document.createElement("section");
  section.className = "game-details-comments";
  section.setAttribute("aria-labelledby", "game-details-comments-title");

  const heading: HTMLHeadingElement = document.createElement("h3");
  heading.className = "game-details-comments__title";
  heading.id = "game-details-comments-title";
  heading.textContent = `Comments (${comments.length})`;

  const { form, textarea } = createCommentForm();
  const list: HTMLUListElement = document.createElement("ul");
  list.className = "game-details-comments__list";

  const commentCards: CommentCard[] = comments.map((comment) =>
    createCommentCard(comment),
  );
  for (const comment of commentCards) list.append(comment.element);

  section.append(heading, form, list);

  return {
    element: section,
    reset: (): void => {
      textarea.value = "";
      textarea.style.height = "";
      textarea.style.overflowY = "hidden";
      textarea.scrollTop = 0;

      for (const comment of commentCards) {
        comment.resetLike();
      }
    },
  };
};
