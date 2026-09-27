import arrowBackIcon from "../../assets/icons/arrow-back.svg";
import arrowForwardIcon from "../../assets/icons/arrow-forward.svg";

import { games } from "./carousel-data";
import { setupCarouselController } from "./carousel-controller";
import { createNavigationButton } from "./create-navigation-button";

import "./carousel.scss";

export const createCarousel = (openGameDetails: () => void): HTMLElement => {
  const section: HTMLElement = document.createElement("section");
  section.className = "carousel";

  const header: HTMLDivElement = document.createElement("div");
  header.className = "carousel__header";

  const heading: HTMLDivElement = document.createElement("div");
  heading.className = "carousel__heading";

  const accent: HTMLSpanElement = document.createElement("span");
  accent.className = "carousel__accent";
  accent.setAttribute("aria-hidden", "true");

  const title: HTMLHeadingElement = document.createElement("h2");
  title.className = "carousel__title";
  title.textContent = "New Games";

  heading.append(accent, title);

  const navigation: HTMLDivElement = document.createElement("div");
  navigation.className = "carousel__navigation";

  const previousButton: HTMLButtonElement = createNavigationButton(
    arrowBackIcon,
    "Previous games",
    "previous",
  );
  const nextButton: HTMLButtonElement = createNavigationButton(
    arrowForwardIcon,
    "Next games",
    "next",
  );
  navigation.append(previousButton, nextButton);

  const track: HTMLDivElement = document.createElement("div");
  track.className = "carousel__track";

  header.append(heading, navigation);
  section.append(header, track);

  setupCarouselController({
    track,
    games,
    openGameDetails,
    previousButton,
    nextButton,
  });

  return section;
};
