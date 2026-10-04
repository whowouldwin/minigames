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

export const createAppRouter = (): AppRouter => {
  const listeners = new Set<RouteListener>();
  let isStarted: boolean = false;

  const notify = (): void => {
    const route = getRoute();
    for (const listener of listeners) listener(route);
  };

  const writeRoute = (
    route: AppRoute,
    shouldReplace: boolean = false,
    state?: DialogHistoryState,
  ): void => {
    const url: string = createRouteUrl(route);
    const currentUrl: string =
      globalThis.location.pathname + globalThis.location.search;
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
          miniGamesDialogBase:
            globalThis.location.pathname + globalThis.location.search,
        };
    writeRoute({ ...route, dialog }, hasOpenDialog, state);
  };

  const closeDialog = (): void => {
    const route = getRoute();
    if (!route.dialog) return;

    const state = globalThis.history.state as DialogHistoryState | undefined;
    if (state?.miniGamesDialogBase) {
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
      globalThis.addEventListener("popstate", notify);
      notify();
    },
  };
};
