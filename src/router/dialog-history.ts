import type { AppRoute } from "./route-state";
import { createRouteUrl } from "./route-url";

export interface DialogHistoryState {
  miniGamesDialogBase?: string;
}

const getCurrentUrl = (): string =>
  globalThis.location.pathname + globalThis.location.search;

const getAbsoluteUrl = (routeUrl: string): string =>
  globalThis.location.origin + routeUrl;

const getHistoryState = (): DialogHistoryState | undefined =>
  globalThis.history.state as DialogHistoryState | undefined;

export const createDialogHistoryState = (
  hasOpenDialog: boolean,
): DialogHistoryState | undefined =>
  hasOpenDialog ? getHistoryState() : { miniGamesDialogBase: getCurrentUrl() };

export const closeDialogUsingHistory = (
  beforeBack: () => void,
): "back" | "no-base" => {
  if (!getHistoryState()?.miniGamesDialogBase) return "no-base";

  beforeBack();
  globalThis.history.back();
  return "back";
};

export const restoreDialogHistory = (route: AppRoute): void => {
  const state = getHistoryState();
  if (!route.dialog || state?.miniGamesDialogBase) return;

  const dialogUrl = getCurrentUrl();
  const baseUrl = createRouteUrl({ ...route, dialog: undefined });
  globalThis.history.replaceState(undefined, "", getAbsoluteUrl(baseUrl));
  globalThis.history.pushState(
    { miniGamesDialogBase: baseUrl },
    "",
    getAbsoluteUrl(dialogUrl),
  );
};
