import { describe, expect, it, vi } from "vitest";
import type { AppSessionController } from "../src/app/app-session-controller";
import { createAuthDialogUrlGuard } from "../src/app/create-auth-dialog-url-guard";
import { createProtectedActionGuard } from "../src/app/protected-action-guard";
import type { SnackbarController } from "../src/components/ui/snackbar";
import type { AppRoute, AppRouter } from "../src/router";

const createRouter = (initialRoute: AppRoute) => {
  let currentRoute = initialRoute;
  let onRouteChange: ((route: AppRoute) => void) | undefined;
  const router = {
    getRoute: (): AppRoute => currentRoute,
    openDialog: vi.fn((dialog: NonNullable<AppRoute["dialog"]>): void => {
      currentRoute = { ...currentRoute, dialog };
      onRouteChange?.(currentRoute);
    }),
    subscribe: vi.fn((listener: (route: AppRoute) => void): (() => void) => {
      onRouteChange = listener;
      return () => {
        onRouteChange = undefined;
      };
    }),
    navigate: vi.fn(),
    closeDialog: vi.fn(),
    setNavigationGuard: vi.fn(),
  };

  return {
    router: router as unknown as AppRouter,
    notify(route: AppRoute): void {
      currentRoute = route;
      onRouteChange?.(route);
    },
  };
};

describe("authentication guards", () => {
  it("allows auth routes for guests and blocks them for signed-in users", () => {
    const snackbar = { show: vi.fn() } as unknown as SnackbarController;
    const session = {
      hasActiveSession: vi.fn(() => true),
    } as unknown as AppSessionController;
    const guard = createAuthDialogUrlGuard(session, snackbar);

    expect(guard()).toBe(true);
    expect(snackbar.show).toHaveBeenCalledWith(
      "You are already signed in.",
      "info",
    );
  });

  it("opens login and shows a warning when a guest uses a protected action", () => {
    const { router } = createRouter({
      page: "library",
      library: { category: "all", sort: "rating-desc", page: 1 },
      dialog: undefined,
    });
    const snackbar = { show: vi.fn() } as unknown as SnackbarController;
    const guard = createProtectedActionGuard(router, () => false, snackbar);

    expect(guard("Save this game")).toBe(false);
    expect(router.openDialog).toHaveBeenCalledWith({
      kind: "auth",
      mode: "login",
    });
    expect(snackbar.show).toHaveBeenCalledWith("Save this game", "warning");
  });

  it("allows protected actions for active sessions without prompting", () => {
    const { router } = createRouter({
      page: "home",
      library: { category: "all", sort: "rating-desc", page: 1 },
    });
    const snackbar = { show: vi.fn() } as unknown as SnackbarController;
    const guard = createProtectedActionGuard(router, () => true, snackbar);

    expect(guard()).toBe(true);
    expect(router.openDialog).not.toHaveBeenCalled();
    expect(snackbar.show).not.toHaveBeenCalled();
  });

  it("reopens the pending game after the login dialog closes", async () => {
    const gameRoute: AppRoute = {
      page: "home",
      library: { category: "all", sort: "rating-desc", page: 1 },
      dialog: { kind: "game", gameSlug: "cozy-game" },
    };
    const { router, notify } = createRouter(gameRoute);
    const snackbar = { show: vi.fn() } as unknown as SnackbarController;
    const guard = createProtectedActionGuard(router, () => false, snackbar);
    guard();

    notify({ ...gameRoute, dialog: { kind: "auth", mode: "login" } });
    notify({ ...gameRoute, dialog: undefined });
    await Promise.resolve();

    expect(router.openDialog).toHaveBeenLastCalledWith({
      kind: "game",
      gameSlug: "cozy-game",
    });
  });

  it("drops a pending game if navigation changes the page before login closes", async () => {
    const gameRoute: AppRoute = {
      page: "home",
      library: { category: "all", sort: "rating-desc", page: 1 },
      dialog: { kind: "game", gameSlug: "cozy-game" },
    };
    const { router, notify } = createRouter(gameRoute);
    const snackbar = { show: vi.fn() } as unknown as SnackbarController;
    const guard = createProtectedActionGuard(router, () => false, snackbar);
    guard();

    notify({
      page: "library",
      library: { category: "all", sort: "rating-desc", page: 1 },
      dialog: undefined,
    });
    await Promise.resolve();

    expect(router.openDialog).toHaveBeenCalledTimes(1);
  });
});
