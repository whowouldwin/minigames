import type { Auth } from "firebase/auth";
import { createAuthDialog } from "../components/auth-dialog";
import type { AuthMode } from "../components/auth-dialog";
import type { SnackbarController } from "../components/ui/snackbar";
import {
  authenticateWithEmailPassword,
  authenticateWithGoogle,
  getAuthenticationErrorMessage,
} from "../auth";
import type { EmailPasswordCredentials } from "../auth";
import type { AppRouter } from "../router";
import type { AppSessionController } from "./app-session-controller";

interface AuthDialogDependencies {
  auth: Auth | undefined;
  router: AppRouter;
  sessionController: AppSessionController;
  snackbar: SnackbarController;
  openAuth: (mode: AuthMode) => void;
}

export const createAppAuthDialog = ({
  auth,
  router,
  sessionController,
  snackbar,
  openAuth,
}: AuthDialogDependencies): ReturnType<typeof createAuthDialog> =>
  createAuthDialog({
    onClose: router.closeDialog,
    onModeChange: openAuth,
    onAuthenticate: async (
      mode: AuthMode,
      credentials: EmailPasswordCredentials,
    ): Promise<void> => {
      let session: Awaited<ReturnType<typeof authenticateWithEmailPassword>>;
      try {
        session = await authenticateWithEmailPassword(auth, mode, credentials);
      } catch (error: unknown) {
        snackbar.show(getAuthenticationErrorMessage(error), "error");
        throw error;
      }

      sessionController.activate(session);
      snackbar.show(
        mode === "register"
          ? "Account created successfully."
          : "Signed in successfully.",
        "success",
      );
    },
    onGoogleAuthenticate: async (): Promise<void> => {
      let session: Awaited<ReturnType<typeof authenticateWithGoogle>>;
      try {
        session = await authenticateWithGoogle(auth);
      } catch (error: unknown) {
        snackbar.show(getAuthenticationErrorMessage(error), "error");
        throw error;
      }

      sessionController.activate(session);
      snackbar.show("Signed in with Google.", "success");
    },
  });
