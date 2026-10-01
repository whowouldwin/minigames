import { createCarousel } from "../../components/carousel";
import { createGameDevelopment } from "../../components/game-dev";
import { createHero } from "../../components/hero";
import { createLeaderboard } from "../../components/leaderboard";
import type { AppPage } from "../../types/app-page";
import type { SnackbarController } from "../../components/ui/snackbar";

export const createHomePage = (
  openGameDetails: () => void,
  navigateTo: (page: AppPage) => void,
  snackbar: SnackbarController,
): HTMLElement => {
  const main: HTMLElement = document.createElement("main");

  main.append(
    createHero(navigateTo),
    createCarousel(openGameDetails, snackbar),
    createLeaderboard(),
    createGameDevelopment(),
  );

  return main;
};
