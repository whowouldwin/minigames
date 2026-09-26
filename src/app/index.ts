import { createHeader } from "../components/header";
import { createFooter } from "../components/footer";
import { createAuthDialog } from "../components/auth-dialog";
import { createGameDetailsDialog } from "../components/game-details-dialog";
import { updateNavigationState } from "../components/navigation/create-navigation-list";
import { createHomePage } from "../pages/home";
import { createLibraryPage } from "../pages/library";
import type { AppPage } from "../types/app-page";

export const createApp = (): HTMLDivElement => {
  const app: HTMLDivElement = document.createElement("div");
  app.className = "app";

  const auth: ReturnType<typeof createAuthDialog> = createAuthDialog();
  const gameDetails: ReturnType<typeof createGameDetailsDialog> =
    createGameDetailsDialog();
  const pageOutlet: HTMLDivElement = document.createElement("div");
  pageOutlet.className = "app__page";
  pageOutlet.append(createHomePage());

  const navigateTo = (page: AppPage): void => {
    const nextPage: HTMLElement =
      page === "home" ? createHomePage() : createLibraryPage(gameDetails.open);
    pageOutlet.replaceChildren(nextPage);
    updateNavigationState(header, page);
  };

  const header: HTMLElement = createHeader(auth.open, "home", navigateTo);
  app.append(
    header,
    pageOutlet,
    createFooter(navigateTo),
    auth.element,
    gameDetails.element,
  );

  return app;
};
