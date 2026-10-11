import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppSession } from "../src/auth/app-session";
import type { SnackbarController } from "../src/components/ui/snackbar";
import type { AppRouter } from "../src/router";
import { createDeferred } from "./helpers/deferred";

const {
  createAppSessionLifecycle,
  authenticateWithEmailPassword,
  authenticateWithGoogle,
  getAuthenticationErrorMessage,
  createAuthDialog,
  createLibraryPage,
  createHomePage,
  createNotFoundPage,
  updateNavigationState,
} = vi.hoisted(() => ({
  createAppSessionLifecycle: vi.fn(),
  authenticateWithEmailPassword: vi.fn(),
  authenticateWithGoogle: vi.fn(),
  getAuthenticationErrorMessage: vi.fn((error: unknown) =>
    error instanceof Error ? error.message : "Authentication failed.",
  ),
  createAuthDialog: vi.fn((options) => options),
  createLibraryPage: vi.fn(),
  createHomePage: vi.fn(),
  createNotFoundPage: vi.fn(),
  updateNavigationState: vi.fn(),
}));

vi.mock("../src/auth", () => ({
  createAppSessionLifecycle,
  authenticateWithEmailPassword,
  authenticateWithGoogle,
  getAuthenticationErrorMessage,
}));
vi.mock("../src/components/auth-dialog", () => ({ createAuthDialog }));
vi.mock("../src/pages/library", () => ({ createLibraryPage }));
vi.mock("../src/pages/home", () => ({ createHomePage }));
vi.mock("../src/pages/not-found", () => ({ createNotFoundPage }));
vi.mock("../src/components/navigation/create-navigation-list", () => ({
  updateNavigationState,
}));

import { createAppSessionController } from "../src/app/app-session-controller";
import { createAppAuthDialog } from "../src/app/create-auth-dialog";
import { createPageRenderer } from "../src/app/create-page-renderer";
import { createDialogRouteSync } from "../src/app/synchronize-dialog-route";
import type { AppSessionLifecycle } from "../src/auth/app-session-lifecycle";

const session: AppSession = {
  displayName: "Lera",
  email: "lera@example.com",
  authenticatedAt: 1,
};

const snackbar = { show: vi.fn() } as unknown as SnackbarController;

describe("application session controller", () => {
  const lifecycle = {
    restore: vi.fn(),
    check: vi.fn(),
    activate: vi.fn(),
    logout: vi.fn(),
  } satisfies AppSessionLifecycle;

  const router = { setNavigationGuard: vi.fn() } as unknown as AppRouter;
  const header = {
    element: document.createElement("header"),
    setGuest: vi.fn(),
    setAuthenticated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    createAppSessionLifecycle.mockReturnValue(lifecycle);
    lifecycle.restore.mockReturnValue(undefined);
    lifecycle.check.mockReturnValue(undefined);
  });

  it("connects session validation to route navigation and restores a user", async () => {
    lifecycle.restore.mockReturnValue(session);
    const controller = createAppSessionController(
      undefined,
      router,
      header,
      snackbar,
    );

    controller.start();

    expect(createAppSessionLifecycle).toHaveBeenCalledOnce();
    expect(router.setNavigationGuard).toHaveBeenCalledWith(lifecycle.check);
    expect(header.setAuthenticated).toHaveBeenCalledWith(session);
    expect(controller.getActiveSession()).toBeUndefined();
    expect(controller.hasActiveSession()).toBe(false);
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    lifecycle.check.mockClear();
    document.dispatchEvent(new Event("visibilitychange"));
    globalThis.dispatchEvent(new Event("pageshow"));

    expect(lifecycle.check).toHaveBeenCalledTimes(2);
    const [, onSessionEnd] = createAppSessionLifecycle.mock.calls.at(-1) ?? [];
    controller.activate(session);
    onSessionEnd?.("expired");
    await controller.logout();

    expect(lifecycle.activate).toHaveBeenCalledWith(session);
    expect(header.setAuthenticated).toHaveBeenCalledWith(session);
    expect(header.setGuest).toHaveBeenCalledOnce();
    expect(snackbar.show).toHaveBeenCalledWith(
      "Your session expired. You are now in Guest Mode.",
      "info",
    );
    expect(lifecycle.logout).toHaveBeenCalledOnce();
  });
});

describe("application authentication dialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("activates the authenticated session and confirms successful login", async () => {
    authenticateWithEmailPassword.mockResolvedValue(session);
    const activate = vi.fn();
    const router = { closeDialog: vi.fn() } as unknown as AppRouter;
    const dialog = createAppAuthDialog({
      auth: undefined,
      router,
      sessionController: { activate } as never,
      snackbar,
      openAuth: vi.fn(),
    }) as unknown as {
      onAuthenticate: (mode: "login", credentials: object) => Promise<void>;
      onGoogleAuthenticate: () => Promise<void>;
      onClose: () => void;
    };

    await dialog.onAuthenticate("login", {
      email: "lera@example.com",
      password: "Secret1!",
    });
    dialog.onClose();

    expect(activate).toHaveBeenCalledWith(session);
    expect(snackbar.show).toHaveBeenCalledWith(
      "Signed in successfully.",
      "success",
    );
    expect(router.closeDialog).toHaveBeenCalledOnce();
  });

  it("shows mapped errors and rethrows failed authentication", async () => {
    authenticateWithEmailPassword.mockRejectedValue(
      new Error("Friendly error"),
    );
    const dialog = createAppAuthDialog({
      auth: undefined,
      router: { closeDialog: vi.fn() } as unknown as AppRouter,
      sessionController: { activate: vi.fn() } as never,
      snackbar,
      openAuth: vi.fn(),
    }) as unknown as {
      onAuthenticate: (mode: "register", credentials: object) => Promise<void>;
    };

    await expect(
      dialog.onAuthenticate("register", { email: "lera@example.com" }),
    ).rejects.toThrow("Friendly error");
    expect(snackbar.show).toHaveBeenCalledWith("Friendly error", "error");
  });

  it("handles Google success and Google failure", async () => {
    const activate = vi.fn();
    const dialog = createAppAuthDialog({
      auth: undefined,
      router: { closeDialog: vi.fn() } as unknown as AppRouter,
      sessionController: { activate } as never,
      snackbar,
      openAuth: vi.fn(),
    }) as unknown as { onGoogleAuthenticate: () => Promise<void> };
    authenticateWithGoogle.mockResolvedValueOnce(session);
    await dialog.onGoogleAuthenticate();
    authenticateWithGoogle.mockRejectedValueOnce(
      new Error("Google unavailable"),
    );
    await expect(dialog.onGoogleAuthenticate()).rejects.toThrow(
      "Google unavailable",
    );

    expect(activate).toHaveBeenCalledOnce();
    expect(snackbar.show).toHaveBeenCalledWith(
      "Signed in with Google.",
      "success",
    );
    expect(snackbar.show).toHaveBeenCalledWith("Google unavailable", "error");
  });
});

describe("application page renderer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders and updates the library page without recreating it", () => {
    const libraryElement = document.createElement("section");
    const update = vi.fn();
    const destroy = vi.fn();
    createLibraryPage.mockReturnValue({
      element: libraryElement,
      update,
      destroy,
    });
    const renderer = createPageRenderer({
      router: { getRoute: vi.fn(), navigate: vi.fn() } as unknown as AppRouter,
      headerElement: document.createElement("header"),
      snackbar,
      navigateTo: vi.fn(),
      openGameDetails: vi.fn(),
      synchronizeDialogs: vi.fn(),
    });
    const route = {
      page: "library",
      library: { category: "puzzle", sort: "rating-desc", page: 2 },
      dialog: undefined,
    } as const;

    renderer.render(route);
    renderer.render(route);

    expect(createLibraryPage).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith(route.library);
    expect(renderer.element.firstElementChild).toBe(libraryElement);
    expect(updateNavigationState).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      "library",
    );
  });

  it("destroys the library when navigating to home and handles not-found routes", () => {
    const libraryElement = document.createElement("section");
    const destroy = vi.fn();
    createLibraryPage.mockReturnValue({
      element: libraryElement,
      update: vi.fn(),
      destroy,
    });
    createHomePage.mockReturnValue(document.createElement("main"));
    createNotFoundPage.mockReturnValue(document.createElement("main"));
    const navigateTo = vi.fn();
    const renderer = createPageRenderer({
      router: { getRoute: vi.fn(), navigate: vi.fn() } as unknown as AppRouter,
      headerElement: document.createElement("header"),
      snackbar,
      navigateTo,
      openGameDetails: vi.fn(),
      synchronizeDialogs: vi.fn(),
    });

    renderer.render({
      page: "library",
      library: { category: "all", sort: "rating-desc", page: 1 },
      dialog: undefined,
    });
    renderer.render({
      page: "home",
      library: { category: "all", sort: "rating-desc", page: 1 },
      dialog: undefined,
    });
    renderer.render({
      page: "not-found",
      path: "/lost",
      library: { category: "all", sort: "rating-desc", page: 1 },
      dialog: undefined,
    });

    expect(destroy).toHaveBeenCalledOnce();
    const returnHome = createNotFoundPage.mock.calls[0]?.[0] as () => void;
    returnHome();
    expect(navigateTo).toHaveBeenCalledWith("home");
    expect(renderer.element.firstElementChild).toBeInstanceOf(HTMLElement);
  });
});

describe("dialog route synchronization", () => {
  it("closes the inactive dialog before opening the selected one", async () => {
    const calls: string[] = [];
    const auth = {
      close: vi.fn(async () => {
        calls.push("auth-close");
      }),
      open: vi.fn(() => {
        calls.push("auth-open");
      }),
    };
    const game = {
      close: vi.fn(async () => {
        calls.push("game-close");
      }),
      open: vi.fn(() => {
        calls.push("game-open");
      }),
    };
    const synchronize = createDialogRouteSync(auth as never, game as never);

    synchronize({ kind: "auth", mode: "login" });
    await vi.waitFor(() => expect(auth.open).toHaveBeenCalledWith("login"));

    expect(calls).toEqual(["game-close", "auth-open"]);
    synchronize(undefined);
    await vi.waitFor(() => expect(auth.close).toHaveBeenCalledOnce());
  });

  it("skips stale opens when a newer route arrives during close animation", async () => {
    const { promise, resolve: resolveClose } = createDeferred<void>();
    const auth = {
      close: vi
        .fn()
        .mockImplementationOnce(() => promise)
        .mockResolvedValue(undefined),
      open: vi.fn(),
    };
    const game = { close: vi.fn().mockResolvedValue(undefined), open: vi.fn() };
    const synchronize = createDialogRouteSync(auth as never, game as never);

    synchronize({ kind: "game", gameSlug: "first" });
    synchronize({ kind: "game", gameSlug: "second" });
    resolveClose();
    await vi.waitFor(() => expect(game.open).toHaveBeenCalledWith("second"));

    expect(game.open).not.toHaveBeenCalledWith("first");
  });
});
