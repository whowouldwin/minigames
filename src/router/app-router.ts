import type { AppRoute, DialogRoute } from "./route-state";
import { createRouteUrl } from "./route-url";
import {
  getCurrentRouteUrl,
  readCurrentAppRoute,
  removeAuthDialogFromCurrentUrl,
  writeRouteToHistory,
} from "./route-history";
import {
  createDialogHistoryState,
  restoreDialogHistory,
  closeDialogUsingHistory,
} from "./dialog-history";
import type { DialogHistoryState } from "./dialog-history";

type RouteListener = (route: AppRoute) => void;

export interface AppRouter {
  getRoute: () => AppRoute;
  subscribe: (listener: RouteListener) => void;
  navigate: (route: AppRoute) => void;
  openDialog: (dialog: DialogRoute) => void;
  closeDialog: () => void;
  setNavigationGuard: (guard: () => void) => void;
  setAuthDialogGuard: (shouldBlockAuthDialog: () => boolean) => void;
  start: () => void;
}

export const createAppRouter = (): AppRouter => {
  const listeners = new Set<RouteListener>();
  let isStarted: boolean = false;
  let isDialogClosePending: boolean = false;
  let navigationGuard: (() => void) | undefined;
  let authDialogGuard: (() => boolean) | undefined;

  const checkNavigation = (): void => {
    navigationGuard?.();
  };

  const getRouteAfterAuthGuard = (): AppRoute => {
    const route = readCurrentAppRoute();
    if (route.dialog?.kind !== "auth" || !authDialogGuard?.()) return route;

    removeAuthDialogFromCurrentUrl();
    return readCurrentAppRoute();
  };

  const notify = (): void => {
    isDialogClosePending = false;
    const route = getRouteAfterAuthGuard();
    for (const listener of listeners) listener(route);
  };

  const notifyAfterPopState = (): void => {
    checkNavigation();
    notify();
  };

  const writeRoute = (
    route: AppRoute,
    shouldReplace: boolean = false,
    state?: DialogHistoryState,
  ): void => {
    checkNavigation();
    if (route.dialog?.kind === "auth" && authDialogGuard?.()) {
      if (readCurrentAppRoute().dialog?.kind === "auth") {
        removeAuthDialogFromCurrentUrl();
        notify();
      }
      return;
    }

    const url: string = createRouteUrl(route);
    if (url === getCurrentRouteUrl()) return;

    writeRouteToHistory(url, shouldReplace, state);
    notify();
  };

  const openDialog = (dialog: DialogRoute): void => {
    const route = readCurrentAppRoute();
    const hasOpenDialog: boolean = route.dialog !== undefined;
    const state: DialogHistoryState | undefined =
      createDialogHistoryState(hasOpenDialog);
    writeRoute({ ...route, dialog }, hasOpenDialog, state);
  };

  const closeDialog = (): void => {
    const route = readCurrentAppRoute();
    if (isDialogClosePending || !route.dialog) return;

    if (closeDialogUsingHistory(checkNavigation) === "back") {
      isDialogClosePending = true;
      return;
    }

    writeRoute({ ...route, dialog: undefined }, true);
  };

  return {
    getRoute: readCurrentAppRoute,
    subscribe: (listener): void => {
      listeners.add(listener);
    },
    navigate: (route): void => writeRoute(route),
    openDialog,
    closeDialog,
    setNavigationGuard: (guard): void => {
      navigationGuard = guard;
    },
    setAuthDialogGuard: (shouldBlockAuthDialog): void => {
      authDialogGuard = shouldBlockAuthDialog;
    },
    start: (): void => {
      if (isStarted) return;
      isStarted = true;
      checkNavigation();
      getRouteAfterAuthGuard();
      restoreDialogHistory(readCurrentAppRoute());
      globalThis.addEventListener("popstate", notifyAfterPopState);
      notify();
    },
  };
};
