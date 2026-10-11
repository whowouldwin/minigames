import type { Auth } from "firebase/auth";
import { createAppSessionLifecycle } from "../auth";
import type { AppSession } from "../auth";
import type { HeaderController } from "../components/header";
import type { SnackbarController } from "../components/ui/snackbar";
import type { AppRouter } from "../router";

export interface AppSessionController {
  start: () => void;
  activate: (session: AppSession) => void;
  getActiveSession: () => AppSession | undefined;
  hasActiveSession: () => boolean;
  logout: () => Promise<void>;
}

export const createAppSessionController = (
  auth: Auth | undefined,
  router: AppRouter,
  header: HeaderController,
  snackbar: SnackbarController,
): AppSessionController => {
  const lifecycle = createAppSessionLifecycle(auth, (reason): void => {
    header.setGuest();
    if (reason === "expired") {
      snackbar.show("Your session expired. You are now in Guest Mode.", "info");
    }
  });

  router.setNavigationGuard(lifecycle.check);

  return {
    start: (): void => {
      const session = lifecycle.restore();
      if (session) header.setAuthenticated(session);

      document.addEventListener("visibilitychange", (): void => {
        if (document.visibilityState === "visible") lifecycle.check();
      });
      globalThis.addEventListener("pageshow", (): void => {
        lifecycle.check();
      });
    },
    activate: (session): void => {
      lifecycle.activate(session);
      header.setAuthenticated(session);
    },
    getActiveSession: lifecycle.check,
    hasActiveSession: (): boolean => lifecycle.check() !== undefined,
    logout: lifecycle.logout,
  };
};
