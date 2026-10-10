import type { AppRoute, AppRouter } from "../router";
import type { SnackbarController } from "../components/ui/snackbar";

export const createProtectedActionGuard = (
  router: AppRouter,
  hasActiveSession: () => boolean,
  snackbar: SnackbarController,
): ((message?: string) => boolean) => {
  let pendingGameRoute: AppRoute | undefined;

  router.subscribe((route): void => {
    if (!pendingGameRoute || route.dialog?.kind === "auth") return;

    const gameRoute = pendingGameRoute;
    pendingGameRoute = undefined;
    if (route.page !== gameRoute.page || route.dialog) return;

    globalThis.queueMicrotask((): void => {
      const currentRoute = router.getRoute();
      if (
        currentRoute.page === gameRoute.page &&
        !currentRoute.dialog &&
        gameRoute.dialog?.kind === "game"
      ) {
        router.openDialog(gameRoute.dialog);
      }
    });
  });

  return (message?: string): boolean => {
    if (hasActiveSession()) return true;

    const route = router.getRoute();
    if (route.dialog?.kind === "game") pendingGameRoute = route;
    router.openDialog({ kind: "auth", mode: "login" });
    snackbar.show(message ?? "Sign in to use this feature.", "warning");
    return false;
  };
};
