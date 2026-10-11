import { afterEach, describe, expect, it } from "vitest";
import type { User } from "firebase/auth";
import { createAppSession } from "../src/auth/create-app-session";
import {
  APP_SESSION_STORAGE_KEY,
  clearAppSession,
  getActiveAppSession,
} from "../src/auth/app-session-storage";

const createUser = (options: Partial<User> = {}): User =>
  ({
    email: "lera@example.com",
    displayName: "  Lera  ",
    ...options,
  }) as User;

describe("createAppSession", () => {
  afterEach(() => {
    clearAppSession();
  });

  it("normalizes the profile and persists the created session", () => {
    const session = createAppSession(
      createUser({ photoURL: "https://example.test/avatar.png" }),
    );

    expect(session).toEqual({
      displayName: "Lera",
      email: "lera@example.com",
      authenticatedAt: expect.any(Number),
      avatarUrl: "https://example.test/avatar.png",
    });
    expect(getActiveAppSession()).toEqual(session);
    expect(
      JSON.parse(localStorage.getItem(APP_SESSION_STORAGE_KEY) ?? "{}"),
    ).toEqual(session);
  });

  it("uses the email name and then Player when the display name is empty", () => {
    expect(
      createAppSession(createUser({ displayName: undefined })).displayName,
    ).toBe("lera");
    expect(
      createAppSession(
        createUser({ email: "@example.com", displayName: undefined }),
      ).displayName,
    ).toBe("Player");
  });

  it("rejects Firebase users without an email", () => {
    expect(() => createAppSession(createUser({ email: undefined }))).toThrow(
      "The authenticated user has no email.",
    );
  });
});
