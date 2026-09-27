import { createCarousel } from "../../components/carousel";
import { createGameDevelopment } from "../../components/game-dev";
import { createHero } from "../../components/hero";
import { createLeaderboard } from "../../components/leaderboard";
import type { AppPage } from "../../types/app-page";

export const createHomePage = (
  openGameDetails: () => void,
  navigateTo: (page: AppPage) => void,
): HTMLElement => {
  const main: HTMLElement = document.createElement("main");

  main.append(
    createHero(navigateTo),
    createCarousel(openGameDetails),
    createLeaderboard(),
    createGameDevelopment(),
  );

  return main;
};
