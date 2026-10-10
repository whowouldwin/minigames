export const createGameDetailsTitle = (text: string): HTMLHeadingElement => {
  const title: HTMLHeadingElement = document.createElement("h2");
  title.className = "game-details-dialog__title";
  title.id = "game-details-title";
  title.textContent = text;
  return title;
};
