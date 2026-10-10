import type { AppRoute, DialogRoute } from "./route-state";
import { createRouteUrl, readRouteUrl } from "./route-url";
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
  start: () => void;
}

const getRoute = (): AppRoute =>
  readRouteUrl(new URL(globalThis.location.href));

const getCurrentUrl = (): string =>
  globalThis.location.pathname + globalThis.location.search;

const getAbsoluteUrl = (routeUrl: string): string =>
  globalThis.location.origin + routeUrl;

export const createAppRouter = (): AppRouter => {
  const listeners = new Set<RouteListener>();
  let isStarted: boolean = false;
  let isDialogClosePending: boolean = false;
  let navigationGuard: (() => void) | undefined;

  const checkNavigation = (): void => {
    navigationGuard?.();
  };

  const notify = (): void => {
    isDialogClosePending = false;
    const route = getRoute();
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
    const url: string = createRouteUrl(route);
    const currentUrl: string = getCurrentUrl();
    if (url === currentUrl) return;

    if (shouldReplace) {
      globalThis.history.replaceState(state, "", getAbsoluteUrl(url));
    } else {
      globalThis.history.pushState(state, "", getAbsoluteUrl(url));
    }
    notify();
  };

  const openDialog = (dialog: DialogRoute): void => {
    const route = getRoute();
    const hasOpenDialog: boolean = route.dialog !== undefined;
    const state: DialogHistoryState | undefined =
      createDialogHistoryState(hasOpenDialog);
    writeRoute({ ...route, dialog }, hasOpenDialog, state);
  };

  const closeDialog = (): void => {
    const route = getRoute();
    if (isDialogClosePending || !route.dialog) return;

    if (closeDialogUsingHistory(checkNavigation) === "back") {
      isDialogClosePending = true;
      return;
    }

    writeRoute({ ...route, dialog: undefined }, true);
  };

  return {
    getRoute,
    subscribe: (listener): void => {
      listeners.add(listener);
    },
    navigate: (route): void => writeRoute(route),
    openDialog,
    closeDialog,
    setNavigationGuard: (guard): void => {
      navigationGuard = guard;
    },
    start: (): void => {
      if (isStarted) return;
      isStarted = true;
      checkNavigation();
      restoreDialogHistory(getRoute());
      globalThis.addEventListener("popstate", notifyAfterPopState);
      notify();
    },
  };
};
