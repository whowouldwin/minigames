import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  APP_SESSION_STORAGE_KEY,
  clearAppSession,
  getActiveAppSession,
  restoreAppSession,
} from "../src/auth/app-session-storage";
import type { AppSession } from "../src/auth/app-session";

const storedValues = new Map<string, string>();

const storage = {
  getItem: (key: string): string => storedValues.get(key) ?? "",
  setItem: (key: string, value: string): void => {
    storedValues.set(key, value);
  },
  removeItem: (key: string): void => {
    storedValues.delete(key);
  },
};

const validSession: AppSession = {
  displayName: "Lera",
  email: "lera@example.com",
  authenticatedAt: Date.now(),
};

describe("app session storage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", storage as unknown as Storage);
    storedValues.clear();
    clearAppSession();
  });

  it("restores a valid, unexpired session", () => {
    storage.setItem(APP_SESSION_STORAGE_KEY, JSON.stringify(validSession));

    expect(restoreAppSession()).toEqual({
      status: "restored",
      session: validSession,
    });
    expect(getActiveAppSession()).toEqual(validSession);
  });

  it("clears malformed session data", () => {
    storage.setItem(APP_SESSION_STORAGE_KEY, "not-json");

    expect(restoreAppSession()).toEqual({ status: "invalid" });
    expect(storedValues.has(APP_SESSION_STORAGE_KEY)).toBe(false);
    expect(getActiveAppSession()).toBeUndefined();
  });

  it("expires and removes sessions older than the configured duration", () => {
    storage.setItem(
      APP_SESSION_STORAGE_KEY,
      JSON.stringify({
        ...validSession,
        authenticatedAt: Date.now() - 300_000,
      }),
    );

    expect(restoreAppSession()).toEqual({ status: "expired" });
    expect(storedValues.has(APP_SESSION_STORAGE_KEY)).toBe(false);
  });
});
