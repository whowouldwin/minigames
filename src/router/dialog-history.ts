import type { AppRoute } from "./route-state";
import { createRouteUrl } from "./route-url";
import { getAbsoluteRouteUrl, getCurrentRouteUrl } from "./route-history";

export interface DialogHistoryState {
  miniGamesDialogBase?: string;
}

const getHistoryState = (): DialogHistoryState | undefined =>
  globalThis.history.state as DialogHistoryState | undefined;

export const createDialogHistoryState = (
  hasOpenDialog: boolean,
): DialogHistoryState | undefined =>
  hasOpenDialog
    ? getHistoryState()
    : { miniGamesDialogBase: getCurrentRouteUrl() };

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

  const dialogUrl = getCurrentRouteUrl();
  const baseUrl = createRouteUrl({ ...route, dialog: undefined });
  globalThis.history.replaceState(undefined, "", getAbsoluteRouteUrl(baseUrl));
  globalThis.history.pushState(
    { miniGamesDialogBase: baseUrl },
    "",
    getAbsoluteRouteUrl(dialogUrl),
  );
};
