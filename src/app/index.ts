import { createHeader } from "../components/header";
import { createFooter } from "../components/footer";
import type { AuthMode } from "../components/auth-dialog";
import { createGameDetailsDialog } from "../components/game-details-dialog";
import type { AppPage } from "../types/app-page";
import { createSnackbar } from "../components/ui/snackbar";
import { createAppRouter, createPageRoute } from "../router";
import { createAppSessionController } from "./app-session-controller";
import { createProtectedActionGuard } from "./protected-action-guard";
import { createDialogRouteSync } from "./synchronize-dialog-route";
import { createAppAuthDialog } from "./create-auth-dialog";
import { createPageRenderer } from "./create-page-renderer";
import { createAuthDialogUrlGuard } from "./create-auth-dialog-url-guard";
import { auth as firebaseAuth } from "../firebase";

interface AppController {
  element: HTMLDivElement;
  start: () => void;
}

export const createApp = (): AppController => {
  const app: HTMLDivElement = document.createElement("div");
  app.className = "app";

  const router = createAppRouter();
  const snackbar = createSnackbar();
  const openAuth = (mode: AuthMode): void => {
    router.openDialog({ kind: "auth", mode });
  };
  const navigateTo = (page: AppPage): void =>
    router.navigate(createPageRoute(page));
  const openGameDetails = (gameSlug: string): void => {
    router.openDialog({ kind: "game", gameSlug });
  };
  const handleLogout = async (): Promise<void> => {
    try {
      await sessionController.logout();
      snackbar.show("Signed out successfully.", "success");
    } catch {
      snackbar.show(
        "You are in Guest Mode, but Firebase sign-out failed.",
        "error",
      );
    }
  };
  const initialPage = router.getRoute().page;
  const header = createHeader(
    openAuth,
    initialPage === "not-found" ? undefined : initialPage,
    navigateTo,
    (): void => {
      void handleLogout();
    },
  );
  const sessionController = createAppSessionController(
    firebaseAuth,
    router,
    header,
    snackbar,
  );
  router.setAuthDialogGuard(
    createAuthDialogUrlGuard(sessionController, snackbar),
  );
  const requireAuthenticatedSession = createProtectedActionGuard(
    router,
    sessionController.hasActiveSession,
  );
  const auth = createAppAuthDialog({
    auth: firebaseAuth,
    router,
    sessionController,
    snackbar,
    openAuth,
  });
  const gameDetails: ReturnType<typeof createGameDetailsDialog> =
    createGameDetailsDialog(
      snackbar,
      router.closeDialog,
      requireAuthenticatedSession,
    );
  const synchronizeDialogs = createDialogRouteSync(auth, gameDetails);
  const pageRenderer = createPageRenderer({
    router,
    headerElement: header.element,
    snackbar,
    navigateTo,
    openGameDetails,
    synchronizeDialogs,
  });

  router.subscribe(pageRenderer.render);
  app.append(
    header.element,
    pageRenderer.element,
    createFooter(navigateTo),
    auth.element,
    gameDetails.element,
    snackbar.element,
  );

  return {
    element: app,
    start: (): void => {
      sessionController.start();
      router.start();
    },
  };
};
