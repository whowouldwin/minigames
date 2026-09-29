import favoriteIcon from "../../assets/icons/favorite.svg";
import starIcon from "../../assets/icons/star.svg";

import "./library-game-card.scss";

export interface LibraryGame {
  title: string;
  category: string;
  price: string;
  description: string;
  rating: string;
  likes: string;
  image: string;
}

const createMetric = (iconSource: string, value: string): HTMLDivElement => {
  const metric: HTMLDivElement = document.createElement("div");
  metric.className = "library-game-card__metric";

  const icon: HTMLImageElement = document.createElement("img");
  icon.src = iconSource;
  icon.alt = "";
  icon.className = "library-game-card__metric-icon";

  const label: HTMLSpanElement = document.createElement("span");
  label.textContent = value;

  metric.append(icon, label);

  return metric;
};

export const createLibraryGameCard = (
  game: LibraryGame,
  index: number,
  openDetails: () => void,
): HTMLElement => {
  const card: HTMLElement = document.createElement("article");
  card.className = "library-game-card";
  card.setAttribute("aria-labelledby", `library-game-title-${index}`);

  const image: HTMLImageElement = document.createElement("img");
  image.className = "library-game-card__image";
  image.src = game.image;
  image.alt = "";
  image.loading = "lazy";

  const content: HTMLDivElement = document.createElement("div");
  content.className = "library-game-card__content";

  const header: HTMLDivElement = document.createElement("div");
  header.className = "library-game-card__header";

  const identity: HTMLDivElement = document.createElement("div");
  identity.className = "library-game-card__identity";

  const title: HTMLHeadingElement = document.createElement("h2");
  title.className = "library-game-card__title";
  title.id = `library-game-title-${index}`;
  title.textContent = game.title;

  const category: HTMLSpanElement = document.createElement("span");
  category.className = "library-game-card__category";
  category.textContent = game.category;
  identity.append(title, category);

  const price: HTMLParagraphElement = document.createElement("p");
  price.className = "library-game-card__price";
  price.textContent = game.price;

  const description: HTMLParagraphElement = document.createElement("p");
  description.className = "library-game-card__description";
  description.textContent = game.description;

  const metrics: HTMLDivElement = document.createElement("div");
  metrics.className = "library-game-card__metrics";
  metrics.append(
    createMetric(starIcon, game.rating),
    createMetric(favoriteIcon, game.likes),
  );

  const details: HTMLButtonElement = document.createElement("button");
  details.className = "library-game-card__details";
  details.type = "button";
  details.textContent = "Details";
  details.addEventListener("click", openDetails);

  header.append(identity, price);

  const footer: HTMLDivElement = document.createElement("div");
  footer.className = "library-game-card__footer";
  footer.append(metrics, details);

  content.append(header, description, footer);
  card.append(image, content);

  return card;
};
