import { createHeader } from "../components/header";
import { createFooter } from "../components/footer";
import { createAuthDialog } from "../components/auth-dialog";
import type { AuthMode } from "../components/auth-dialog";
import { createGameDetailsDialog } from "../components/game-details-dialog";
import { updateNavigationState } from "../components/navigation/create-navigation-list";
import { createHomePage } from "../pages/home";
import { createLibraryPage } from "../pages/library";
import { createNotFoundPage } from "../pages/not-found";
import type { AppPage } from "../types/app-page";
import { createSnackbar } from "../components/ui/snackbar";
import { createAppRouter, createPageRoute } from "../router";
import type { AppRoute } from "../router";
import { createDialogRouteSync } from "./synchronize-dialog-route";
import { authenticateWithEmailPassword } from "../auth";
import type { EmailPasswordCredentials } from "../auth";
import { auth as firebaseAuth } from "../firebase";

interface AppController {
  element: HTMLDivElement;
  start: () => void;
}

export const createApp = (): AppController => {
  const app: HTMLDivElement = document.createElement("div");
  app.className = "app";

  const router = createAppRouter();
  const openAuth = (mode: AuthMode): void => {
    router.openDialog({ kind: "auth", mode });
  };
  const auth = createAuthDialog({
    onClose: router.closeDialog,
    onModeChange: openAuth,
    onAuthenticate: async (
      mode: AuthMode,
      credentials: EmailPasswordCredentials,
    ): Promise<void> => {
      await authenticateWithEmailPassword(firebaseAuth, mode, credentials);
      snackbar.show(
        mode === "register"
          ? "Account created successfully."
          : "Signed in successfully.",
        "success",
      );
      router.closeDialog();
    },
  });
  const snackbar = createSnackbar();
  const gameDetails: ReturnType<typeof createGameDetailsDialog> =
    createGameDetailsDialog(snackbar, router.closeDialog);
  const synchronizeDialogs = createDialogRouteSync(auth, gameDetails);
  const pageOutlet: HTMLDivElement = document.createElement("div");
  pageOutlet.className = "app__page";

  const navigateTo = (page: AppPage): void =>
    router.navigate(createPageRoute(page));
  const openGameDetails = (gameSlug: string): void => {
    router.openDialog({ kind: "game", gameSlug });
  };

  const initialPage = router.getRoute().page;
  const header = createHeader(
    openAuth,
    initialPage === "not-found" ? undefined : initialPage,
    navigateTo,
  );
  let activePage: AppRoute["page"] | undefined;
  let library: ReturnType<typeof createLibraryPage> | undefined;

  const renderRoute = (route: AppRoute): void => {
    if (activePage !== route.page) {
      library?.destroy();
      library = undefined;

      if (route.page === "library") {
        library = createLibraryPage(
          openGameDetails,
          snackbar,
          (query): void => {
            router.navigate({ ...router.getRoute(), library: query });
          },
        );
        pageOutlet.replaceChildren(library.element);
      } else if (route.page === "not-found") {
        pageOutlet.replaceChildren(
          createNotFoundPage((): void => navigateTo("home")),
        );
      } else {
        pageOutlet.replaceChildren(
          createHomePage(openGameDetails, navigateTo, snackbar),
        );
      }

      activePage = route.page;
      updateNavigationState(
        header,
        route.page === "not-found" ? undefined : route.page,
      );
    }

    if (route.page === "library") library?.update(route.library);
    synchronizeDialogs(route.dialog);
  };

  router.subscribe(renderRoute);
  app.append(
    header,
    pageOutlet,
    createFooter(navigateTo),
    auth.element,
    gameDetails.element,
    snackbar.element,
  );

  return { element: app, start: router.start };
};
