import type { AppRoute } from "./route-state";
import { readRouteUrl } from "./route-url";

export const readCurrentAppRoute = (): AppRoute =>
  readRouteUrl(new URL(globalThis.location.href));

export const getCurrentRouteUrl = (): string =>
  globalThis.location.pathname + globalThis.location.search;

export const getAbsoluteRouteUrl = (routeUrl: string): string =>
  globalThis.location.origin + routeUrl;

export const writeRouteToHistory = (
  routeUrl: string,
  shouldReplace: boolean,
  state?: unknown,
): void => {
  const absoluteUrl: string = getAbsoluteRouteUrl(routeUrl);
  if (shouldReplace) {
    globalThis.history.replaceState(state, "", absoluteUrl);
  } else {
    globalThis.history.pushState(state, "", absoluteUrl);
  }
};

export const removeAuthDialogFromCurrentUrl = (): void => {
  const url = new URL(globalThis.location.href);
  url.searchParams.delete("auth");
  if (url.href === globalThis.location.href) return;

  const state = globalThis.history.state;
  if (state && typeof state === "object") {
    const nextState: Record<string, unknown> = { ...state };
    delete nextState.miniGamesDialogBase;
    globalThis.history.replaceState(
      Object.keys(nextState).length > 0 ? nextState : undefined,
      "",
      url.href,
    );
    return;
  }

  globalThis.history.replaceState(state, "", url.href);
};
