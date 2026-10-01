import "./request-feedback.scss";

export type SkeletonKind = "cards" | "rows" | "table" | "dialog";

export const createRequestSkeleton = (
  label: string,
  kind: SkeletonKind,
  count: number,
): HTMLDivElement => {
  const skeleton: HTMLDivElement = document.createElement("div");
  skeleton.className = `request-skeleton request-skeleton--${kind}`;
  skeleton.setAttribute("role", "status");
  skeleton.setAttribute("aria-label", label);
  skeleton.setAttribute("aria-busy", "true");

  for (let index = 0; index < count; index += 1) {
    const item: HTMLDivElement = document.createElement("div");
    item.className = "request-skeleton__item";
    item.setAttribute("aria-hidden", "true");
    skeleton.append(item);
  }

  return skeleton;
};

export const createEmptyState = (message: string): HTMLDivElement => {
  const empty: HTMLDivElement = document.createElement("div");
  empty.className = "request-feedback request-feedback--empty";
  empty.setAttribute("role", "status");

  const text: HTMLParagraphElement = document.createElement("p");
  text.textContent = message;
  empty.append(text);

  return empty;
};

export const createErrorState = (
  message: string,
  retry: () => void,
): HTMLElement => {
  const banner: HTMLElement = document.createElement("section");
  banner.className = "request-feedback request-feedback--error";
  banner.setAttribute("role", "alert");

  const text: HTMLParagraphElement = document.createElement("p");
  text.textContent = message;

  const button: HTMLButtonElement = document.createElement("button");
  button.className = "request-feedback__retry";
  button.type = "button";
  button.textContent = "Try again";
  button.addEventListener("click", retry);

  banner.append(text, button);
  return banner;
};
