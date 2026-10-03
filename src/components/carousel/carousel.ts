import arrowBackIcon from "../../assets/icons/arrow-back.svg";
import arrowForwardIcon from "../../assets/icons/arrow-forward.svg";

import { appAssetUrl, getErrorMessage, getFeaturedGames } from "../../api";
import type { GameSummary } from "../../api";
import {
  createEmptyState,
  createErrorState,
  createRequestSkeleton,
} from "../ui/request-feedback";
import type { SnackbarController } from "../ui/snackbar";
import { setupCarouselController } from "./carousel-controller";
import { createNavigationButton } from "./create-navigation-button";

import "./carousel.scss";

const formatCompactCount = (count: number): string =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);

const toCardData = (game: GameSummary) => ({
  title: game.name,
  image: appAssetUrl(game.cardImage),
  rating: game.rating.toFixed(1),
  likes: formatCompactCount(game.likesCount),
});

export const createCarousel = (
  openGameDetails: () => void,
  snackbar: SnackbarController,
): HTMLElement => {
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
  track.replaceChildren(
    createRequestSkeleton("Loading featured games", "cards", 5),
  );

  header.append(heading, navigation);
  section.append(header, track);

  const loadGames = async (): Promise<void> => {
    track.replaceChildren(
      createRequestSkeleton("Loading featured games", "cards", 5),
    );

    try {
      const response = await getFeaturedGames();
      if (!track.isConnected) return;

      if (response.data.length === 0) {
        track.replaceChildren(
          createEmptyState("No featured games are available yet."),
        );
        return;
      }

      const games = response.data.map((game: GameSummary) => toCardData(game));
      setupCarouselController({
        track,
        games,
        openGameDetails,
        previousButton,
        nextButton,
      });
    } catch (error) {
      if (!track.isConnected) return;

      const message = getErrorMessage(
        error,
        "Featured games could not be loaded.",
      );
      snackbar.show("Featured games could not be loaded.", "error");
      track.replaceChildren(
        createErrorState(message, (): void => {
          void loadGames();
        }),
      );
    }
  };

  void loadGames();

  return section;
};
