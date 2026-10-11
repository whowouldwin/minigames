import { describe, expect, it } from "vitest";
import { readDialogRoute } from "../src/router/read-dialog-route";
import { readLibraryQuery } from "../src/router/read-library-query";
import { readPageRoute } from "../src/router/read-page-route";
import type { AppRoute } from "../src/router/route-state";
import {
  createRouteUrl,
  getPagePath,
  readRouteUrl,
} from "../src/router/route-url";

describe("route readers and URL creation", () => {
  it("recognizes pages and preserves unknown paths", () => {
    expect(readPageRoute("/", "/")).toEqual({ page: "home" });
    expect(readPageRoute("/home/", "/")).toEqual({ page: "home" });
    expect(readPageRoute("/library", "/")).toEqual({ page: "library" });
    expect(readPageRoute("/missing", "/")).toEqual({
      page: "not-found",
      path: "/missing",
    });
  });

  it("validates library filters and page numbers from the URL", () => {
    expect(
      readLibraryQuery(
        new URLSearchParams("category=puzzle&sort=name-asc&page=3"),
      ),
    ).toEqual({ category: "puzzle", sort: "name-asc", page: 3 });
    expect(
      readLibraryQuery(
        new URLSearchParams("category=unknown&sort=invalid&page=-1"),
      ),
    ).toEqual({ category: "all", sort: "rating-desc", page: 1 });
  });

  it("prefers game dialogs and accepts only supported auth modes", () => {
    expect(
      readDialogRoute(new URLSearchParams("game=cozy&auth=register")),
    ).toEqual({ kind: "game", gameSlug: "cozy" });
    expect(readDialogRoute(new URLSearchParams("auth=register"))).toEqual({
      kind: "auth",
      mode: "register",
    });
    expect(
      readDialogRoute(new URLSearchParams("auth=unknown")),
    ).toBeUndefined();
  });

  it("reads and builds routes with library state and dialogs", () => {
    const route: AppRoute = {
      page: "library",
      library: { category: "farm", sort: "name-desc", page: 2 },
      dialog: { kind: "auth", mode: "login" },
    };

    expect(getPagePath("library")).toBe("/library");
    expect(createRouteUrl(route)).toBe(
      "/library?category=farm&sort=name-desc&page=2&auth=login",
    );
    expect(
      readRouteUrl(
        new URL(
          "https://example.test/library?category=puzzle&page=2&game=cozy",
        ),
      ),
    ).toEqual({
      page: "library",
      library: { category: "puzzle", sort: "rating-desc", page: 2 },
      dialog: { kind: "game", gameSlug: "cozy" },
    });
  });
});
