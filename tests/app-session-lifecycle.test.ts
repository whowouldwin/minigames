import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Auth } from "firebase/auth";
import { APP_SESSION_DURATION_MS } from "../src/auth/app-session";
import type { AppSession } from "../src/auth/app-session";

const { signOut, clearAppSession, restoreAppSession } = vi.hoisted(() => ({
  signOut: vi.fn(),
  clearAppSession: vi.fn(),
  restoreAppSession: vi.fn(),
}));

vi.mock("firebase/auth", () => ({ signOut }));
vi.mock("../src/auth/app-session-storage", () => ({
  clearAppSession,
  restoreAppSession,
}));

import { createAppSessionLifecycle } from "../src/auth/app-session-lifecycle";

const session: AppSession = {
  displayName: "Lera",
  email: "lera@example.com",
  authenticatedAt: Date.now(),
};

describe("app session lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(session.authenticatedAt);
    signOut.mockReset().mockResolvedValue(undefined);
    clearAppSession.mockReset();
    restoreAppSession.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("restores a valid session and schedules expiration", () => {
    restoreAppSession.mockReturnValue({ status: "restored", session });
    const lifecycle = createAppSessionLifecycle({} as Auth, vi.fn());

    expect(lifecycle.restore()).toEqual(session);
    expect(vi.getTimerCount()).toBe(1);
    expect(restoreAppSession).toHaveBeenCalledOnce();
  });

  it("expires the session, clears saved state, and signs out Firebase", () => {
    const onSessionEnd = vi.fn();
    restoreAppSession.mockReturnValue({ status: "expired" });
    const lifecycle = createAppSessionLifecycle({} as Auth, onSessionEnd);

    expect(lifecycle.check()).toBeUndefined();
    expect(clearAppSession).toHaveBeenCalledOnce();
    expect(onSessionEnd).toHaveBeenCalledWith("expired");
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("treats a missing saved session as invalid after activation", () => {
    const onSessionEnd = vi.fn();
    restoreAppSession.mockReturnValue({ status: "missing" });
    const lifecycle = createAppSessionLifecycle({} as Auth, onSessionEnd);
    lifecycle.activate(session);

    expect(lifecycle.check()).toBeUndefined();
    expect(onSessionEnd).toHaveBeenCalledWith("invalid");
    expect(clearAppSession).toHaveBeenCalledOnce();
  });

  it("expires automatically when the scheduled timer reaches the deadline", () => {
    const onSessionEnd = vi.fn();
    restoreAppSession.mockReturnValue({ status: "expired" });
    const lifecycle = createAppSessionLifecycle({} as Auth, onSessionEnd);
    lifecycle.activate({
      ...session,
      authenticatedAt: Date.now() - APP_SESSION_DURATION_MS,
    });

    vi.runOnlyPendingTimers();

    expect(onSessionEnd).toHaveBeenCalledWith("expired");
    expect(clearAppSession).toHaveBeenCalledOnce();
  });

  it("clears the app session on logout and awaits Firebase sign-out", async () => {
    const onSessionEnd = vi.fn();
    const lifecycle = createAppSessionLifecycle({} as Auth, onSessionEnd);

    await lifecycle.logout();

    expect(clearAppSession).toHaveBeenCalledOnce();
    expect(onSessionEnd).toHaveBeenCalledWith("logout");
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("allows guest logout without contacting Firebase", async () => {
    const lifecycle = createAppSessionLifecycle(undefined, vi.fn());

    await lifecycle.logout();

    expect(clearAppSession).toHaveBeenCalledOnce();
    expect(signOut).not.toHaveBeenCalled();
  });
});
