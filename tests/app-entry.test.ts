import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  createHeader: vi.fn(),
  createFooter: vi.fn(),
  createGameDetailsDialog: vi.fn(),
  createSnackbar: vi.fn(),
  createAppRouter: vi.fn(),
  createPageRoute: vi.fn(),
  createAppSessionController: vi.fn(),
  createProtectedActionGuard: vi.fn(),
  createDialogRouteSync: vi.fn(),
  createAppAuthDialog: vi.fn(),
  createPageRenderer: vi.fn(),
  sessionController: {
    start: vi.fn(),
    logout: vi.fn(),
    hasActiveSession: vi.fn(),
    getActiveSession: vi.fn(),
  },
  router: {
    getRoute: vi.fn(),
    setAuthDialogGuard: vi.fn(),
    navigate: vi.fn(),
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
    subscribe: vi.fn(),
    start: vi.fn(),
  },
  header: { element: document.createElement("header") },
  gameDetails: {
    element: document.createElement("dialog"),
    open: vi.fn(),
    close: vi.fn(),
  },
  snackbar: { element: document.createElement("output"), show: vi.fn() },
  authDialog: { element: document.createElement("dialog") },
  pageRenderer: { element: document.createElement("main"), render: vi.fn() },
}));

vi.mock("../src/components/header", () => ({
  createHeader: state.createHeader,
}));
vi.mock("../src/components/footer", () => ({
  createFooter: state.createFooter,
}));
vi.mock("../src/components/game-details-dialog", () => ({
  createGameDetailsDialog: state.createGameDetailsDialog,
}));
vi.mock("../src/components/ui/snackbar", () => ({
  createSnackbar: state.createSnackbar,
}));
vi.mock("../src/router", () => ({
  createAppRouter: state.createAppRouter,
  createPageRoute: state.createPageRoute,
}));
vi.mock("../src/auth", () => ({}));
vi.mock("../src/firebase", () => ({ auth: {} }));
vi.mock("../src/app/app-session-controller", () => ({
  createAppSessionController: state.createAppSessionController,
}));
vi.mock("../src/app/protected-action-guard", () => ({
  createProtectedActionGuard: state.createProtectedActionGuard,
}));
vi.mock("../src/app/synchronize-dialog-route", () => ({
  createDialogRouteSync: state.createDialogRouteSync,
}));
vi.mock("../src/app/create-auth-dialog", () => ({
  createAppAuthDialog: state.createAppAuthDialog,
}));
vi.mock("../src/app/create-page-renderer", () => ({
  createPageRenderer: state.createPageRenderer,
}));

import { createApp } from "../src/app";

describe("application composition root", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.router.getRoute.mockReturnValue({ page: "home" });
    state.createAppRouter.mockReturnValue(state.router);
    state.createSnackbar.mockReturnValue(state.snackbar);
    state.createHeader.mockImplementation((openAuth) => {
      const element = document.createElement("header");
      const openLogin = document.createElement("button");
      openLogin.addEventListener("click", () => openAuth("login"));
      element.append(openLogin);
      return { ...state.header, element };
    });
    state.createFooter.mockReturnValue(document.createElement("footer"));
    state.createAppSessionController.mockReturnValue(state.sessionController);
    state.createProtectedActionGuard.mockReturnValue(vi.fn(() => true));
    state.createAppAuthDialog.mockReturnValue(state.authDialog);
    state.createGameDetailsDialog.mockReturnValue(state.gameDetails);
    state.createPageRenderer.mockReturnValue(state.pageRenderer);
  });

  it("connects routes and session services, renders the app shell, and starts once", () => {
    state.createPageRoute.mockReturnValue({ page: "library" });
    const app = createApp();
    expect(app.element.querySelector("header")).not.toBeNull();
    expect(app.element.querySelector("footer")).not.toBeNull();
    expect(app.element.children).toHaveLength(6);
    app.element
      .querySelector<HTMLButtonElement>(":scope > header button")!
      .click();
    expect(state.router.openDialog).toHaveBeenCalledWith({
      kind: "auth",
      mode: "login",
    });
    expect(state.router.subscribe).toHaveBeenCalledWith(
      state.pageRenderer.render,
    );
    expect(state.createDialogRouteSync).toHaveBeenCalledWith(
      state.authDialog,
      state.gameDetails,
    );
    app.start();
    expect(state.sessionController.start).toHaveBeenCalledOnce();
    expect(state.router.start).toHaveBeenCalledOnce();
  });

  it("reports logout success and failure in guest mode", async () => {
    state.sessionController.logout
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("offline"));
    const app = createApp();
    const onLogout = state.createHeader.mock.calls.at(-1)?.[3] as () => void;
    onLogout();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(state.snackbar.show).toHaveBeenCalledWith(
      "Signed out successfully.",
      "success",
    );
    onLogout();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(state.snackbar.show).toHaveBeenCalledWith(
      "You are in Guest Mode, but Firebase sign-out failed.",
      "error",
    );
    expect(app.element).toBeInstanceOf(HTMLDivElement);
  });
});
