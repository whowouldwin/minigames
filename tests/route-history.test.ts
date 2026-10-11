import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAbsoluteRouteUrl,
  getCurrentRouteUrl,
  readCurrentAppRoute,
  removeAuthDialogFromCurrentUrl,
  writeRouteToHistory,
} from "../src/router/route-history";
import {
  closeDialogUsingHistory,
  createDialogHistoryState,
  restoreDialogHistory,
} from "../src/router/dialog-history";
import type { AppRoute } from "../src/router/route-state";

describe("route history helpers", () => {
  beforeEach(() => {
    history.replaceState(undefined, "", "/library?category=puzzle&auth=login");
  });

  it("reads and builds route URLs using the current browser origin", () => {
    expect(getCurrentRouteUrl()).toBe("/library?category=puzzle&auth=login");
    expect(getAbsoluteRouteUrl("/library")).toBe(`${location.origin}/library`);
    expect(readCurrentAppRoute()).toMatchObject({
      page: "library",
      library: { category: "puzzle" },
      dialog: { kind: "auth", mode: "login" },
    });
  });

  it("writes pushed and replaced route state with the requested history method", () => {
    const pushSpy = vi.spyOn(history, "pushState");
    const replaceSpy = vi.spyOn(history, "replaceState");

    writeRouteToHistory("/library?page=2", false, { source: "test" });
    writeRouteToHistory("/library?page=3", true);

    expect(pushSpy).toHaveBeenCalledWith(
      { source: "test" },
      "",
      `${location.origin}/library?page=2`,
    );
    expect(replaceSpy).toHaveBeenLastCalledWith(
      undefined,
      "",
      `${location.origin}/library?page=3`,
    );
  });

  it("removes only auth route data while preserving unrelated history state", () => {
    history.replaceState(
      { miniGamesDialogBase: "/library", other: "keep" },
      "",
      "/library?category=puzzle&auth=login",
    );

    removeAuthDialogFromCurrentUrl();

    expect(location.search).toBe("?category=puzzle");
    expect(history.state).toEqual({ other: "keep" });
  });

  it("clears an otherwise empty dialog history state", () => {
    history.replaceState(
      { miniGamesDialogBase: "/library" },
      "",
      "/library?auth=login",
    );

    removeAuthDialogFromCurrentUrl();

    expect(history.state).toBeNull();
  });
});

describe("dialog history helpers", () => {
  beforeEach(() => {
    history.replaceState(undefined, "", "/library?category=puzzle&page=2");
  });

  it("records a base URL only when opening the first dialog", () => {
    history.replaceState({ source: "existing" }, "", "/library");

    expect(createDialogHistoryState(false)).toEqual({
      miniGamesDialogBase: "/library",
    });
    expect(createDialogHistoryState(true)).toEqual({ source: "existing" });
  });

  it("backs out of a dialog when a base route exists", () => {
    history.replaceState(
      { miniGamesDialogBase: "/library" },
      "",
      "/library?game=cozy",
    );
    const beforeBack = vi.fn();

    expect(closeDialogUsingHistory(beforeBack)).toBe("back");
    expect(beforeBack).toHaveBeenCalledOnce();
  });

  it("returns no-base without invoking the callback when history is unrelated", () => {
    history.replaceState({ source: "other" }, "", "/library?game=cozy");
    const beforeBack = vi.fn();

    expect(closeDialogUsingHistory(beforeBack)).toBe("no-base");
    expect(beforeBack).not.toHaveBeenCalled();
  });

  it("inserts a base history entry when restoring a direct dialog URL", () => {
    history.replaceState(
      undefined,
      "",
      "/library?category=puzzle&page=2&game=cozy",
    );
    const route: AppRoute = {
      page: "library",
      library: { category: "puzzle", sort: "rating-desc", page: 2 },
      dialog: { kind: "game", gameSlug: "cozy" },
    };

    restoreDialogHistory(route);

    expect(history.state).toEqual({
      miniGamesDialogBase: "/library?category=puzzle&sort=rating-desc&page=2",
    });
    expect(location.search).toBe("?category=puzzle&page=2&game=cozy");
  });

  it("does not replace a dialog URL when a base history entry is already present", () => {
    history.replaceState(
      { miniGamesDialogBase: "/library" },
      "",
      "/library?game=cozy",
    );
    const initialUrl = location.href;

    restoreDialogHistory({
      page: "library",
      library: { category: "puzzle", sort: "rating-desc", page: 2 },
      dialog: { kind: "game", gameSlug: "cozy" },
    });

    expect(location.href).toBe(initialUrl);
  });
});
