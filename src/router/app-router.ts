import type { AppRoute, DialogRoute } from "./route-state";
import { createRouteUrl, readRouteUrl } from "./route-url";

type RouteListener = (route: AppRoute) => void;

interface DialogHistoryState {
  miniGamesDialogBase?: string;
}

export interface AppRouter {
  getRoute: () => AppRoute;
  subscribe: (listener: RouteListener) => void;
  navigate: (route: AppRoute) => void;
  openDialog: (dialog: DialogRoute) => void;
  closeDialog: () => void;
  start: () => void;
}

const getRoute = (): AppRoute =>
  readRouteUrl(new URL(globalThis.location.href));

const getCurrentUrl = (): string =>
  globalThis.location.pathname + globalThis.location.search;

const restoreDeepLinkHistory = (): void => {
  const route = getRoute();
  const state = globalThis.history.state as DialogHistoryState | undefined;
  if (!route.dialog || state?.miniGamesDialogBase) return;

  const dialogUrl: string = getCurrentUrl();
  const baseUrl: string = createRouteUrl({ ...route, dialog: undefined });
  globalThis.history.replaceState(undefined, "", baseUrl);
  globalThis.history.pushState({ miniGamesDialogBase: baseUrl }, "", dialogUrl);
};

export const createAppRouter = (): AppRouter => {
  const listeners = new Set<RouteListener>();
  let isStarted: boolean = false;
  let isDialogClosePending: boolean = false;

  const notify = (): void => {
    isDialogClosePending = false;
    const route = getRoute();
    for (const listener of listeners) listener(route);
  };

  const writeRoute = (
    route: AppRoute,
    shouldReplace: boolean = false,
    state?: DialogHistoryState,
  ): void => {
    const url: string = createRouteUrl(route);
    const currentUrl: string = getCurrentUrl();
    if (url === currentUrl) return;

    if (shouldReplace) {
      globalThis.history.replaceState(state, "", url);
    } else {
      globalThis.history.pushState(state, "", url);
    }
    notify();
  };

  const openDialog = (dialog: DialogRoute): void => {
    const route = getRoute();
    const hasOpenDialog: boolean = route.dialog !== undefined;
    const state: DialogHistoryState | undefined = hasOpenDialog
      ? globalThis.history.state
      : {
          miniGamesDialogBase: getCurrentUrl(),
        };
    writeRoute({ ...route, dialog }, hasOpenDialog, state);
  };

  const closeDialog = (): void => {
    const route = getRoute();
    if (isDialogClosePending || !route.dialog) return;

    const state = globalThis.history.state as DialogHistoryState | undefined;
    if (state?.miniGamesDialogBase) {
      isDialogClosePending = true;
      globalThis.history.back();
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
    start: (): void => {
      if (isStarted) return;
      isStarted = true;
      restoreDeepLinkHistory();
      globalThis.addEventListener("popstate", notify);
      notify();
    },
  };
};
