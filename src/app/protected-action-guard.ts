import type { AppRoute, AppRouter } from "../router";

export const createProtectedActionGuard = (
  router: AppRouter,
  hasActiveSession: () => boolean,
): (() => boolean) => {
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

  return (): boolean => {
    if (hasActiveSession()) return true;

    const route = router.getRoute();
    if (route.dialog?.kind === "game") pendingGameRoute = route;
    router.openDialog({ kind: "auth", mode: "login" });
    return false;
  };
};
