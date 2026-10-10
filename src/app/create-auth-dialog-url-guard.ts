import type { SnackbarController } from "../components/ui/snackbar";
import type { AppSessionController } from "./app-session-controller";

export const createAuthDialogUrlGuard =
  (
    sessionController: AppSessionController,
    snackbar: SnackbarController,
  ): (() => boolean) =>
  (): boolean => {
    if (!sessionController.hasActiveSession()) return false;

    snackbar.show("You are already signed in.", "info");
    return true;
  };
