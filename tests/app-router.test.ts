import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAppRouter } from "../src/router/app-router";
import type { AppRoute } from "../src/router/route-state";

const homeRoute: AppRoute = {
  page: "home",
  library: { category: "all", sort: "rating-desc", page: 1 },
  dialog: undefined,
};

describe("application router", () => {
  beforeEach(() => {
    history.replaceState(undefined, "", "/");
  });

  it("starts once, checks navigation, restores route state, and notifies listeners", () => {
    const router = createAppRouter();
    const listener = vi.fn();
    const guard = vi.fn();
    router.subscribe(listener);
    router.setNavigationGuard(guard);

    router.start();
    router.start();

    expect(guard).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(homeRoute);
  });

  it("navigates and notifies subscribers with the route from the updated URL", () => {
    const router = createAppRouter();
    const listener = vi.fn();
    router.subscribe(listener);
    router.start();
    listener.mockClear();

    router.navigate({
      page: "library",
      library: { category: "puzzle", sort: "name-asc", page: 3 },
      dialog: undefined,
    });

    expect(location.pathname).toBe("/library");
    expect(new URLSearchParams(location.search).get("page")).toBe("3");
    expect(listener).toHaveBeenCalledWith({
      page: "library",
      library: { category: "puzzle", sort: "name-asc", page: 3 },
      dialog: undefined,
    });
  });

  it("opens and closes a game dialog through browser history", async () => {
    const router = createAppRouter();
    const listener = vi.fn();
    router.subscribe(listener);
    router.start();

    router.openDialog({ kind: "game", gameSlug: "cozy-game" });
    expect(location.search).toBe("?game=cozy-game");
    expect(history.state).toEqual({ miniGamesDialogBase: "/" });

    router.closeDialog();
    await vi.waitFor(() => expect(router.getRoute().dialog).toBeUndefined());

    expect(location.pathname).toBe("/");
    expect(listener).toHaveBeenLastCalledWith(homeRoute);
  });

  it("removes an auth dialog route when the auth guard blocks signed-in users", () => {
    history.replaceState(undefined, "", "/?auth=register");
    const router = createAppRouter();
    const listener = vi.fn();
    router.subscribe(listener);
    router.setAuthDialogGuard(() => true);
    router.start();

    expect(router.getRoute().dialog).toBeUndefined();
    expect(location.search).toBe("");
    expect(listener).toHaveBeenCalledWith(homeRoute);
  });

  it("blocks direct auth navigation and removes an already-open auth route", () => {
    history.replaceState(undefined, "", "/?auth=login");
    const router = createAppRouter();
    const listener = vi.fn();
    router.subscribe(listener);
    router.setAuthDialogGuard(() => true);
    router.start();
    expect(listener).toHaveBeenLastCalledWith(homeRoute);
    listener.mockClear();

    router.navigate({
      ...homeRoute,
      dialog: { kind: "auth", mode: "register" },
    });

    expect(location.search).toBe("");
    expect(listener).not.toHaveBeenCalled();
  });

  it("runs the navigation guard before changing routes and on popstate", () => {
    const router = createAppRouter();
    const guard = vi.fn();
    router.setNavigationGuard(guard);
    router.start();
    guard.mockClear();

    router.navigate({ ...homeRoute, page: "library" });
    globalThis.dispatchEvent(new Event("popstate"));

    expect(guard).toHaveBeenCalledTimes(2);
  });
});
