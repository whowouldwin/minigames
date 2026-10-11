import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Auth, User } from "firebase/auth";

const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
}));

import { authenticateWithEmailPassword } from "../src/auth/email-password-auth";
import {
  AuthenticationCleanupError,
  AuthenticationNotConfiguredError,
} from "../src/auth/auth-errors";
import {
  clearAppSession,
  getActiveAppSession,
} from "../src/auth/app-session-storage";

const auth = {} as Auth;

const createUser = (options: Partial<User> = {}): User =>
  ({
    email: "lera@example.com",
    displayName: "Lera",
    ...options,
  }) as User;

describe("email and password authentication", () => {
  beforeEach(() => {
    clearAppSession();
    createUserWithEmailAndPassword.mockReset();
    signInWithEmailAndPassword.mockReset();
    signOut.mockReset().mockResolvedValue(undefined);
    updateProfile.mockReset();
  });

  afterEach(() => {
    clearAppSession();
  });

  it("fails clearly when Firebase is not configured", async () => {
    await expect(
      authenticateWithEmailPassword(undefined, "login", {
        email: "lera@example.com",
        password: "secret",
      }),
    ).rejects.toBeInstanceOf(AuthenticationNotConfiguredError);
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("signs in and creates an app session from the Firebase user", async () => {
    const user = createUser({ photoURL: "https://example.test/avatar.png" });
    signInWithEmailAndPassword.mockResolvedValue({ user });

    const session = await authenticateWithEmailPassword(auth, "login", {
      email: "lera@example.com",
      password: "secret",
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      "lera@example.com",
      "secret",
    );
    expect(session.displayName).toBe("Lera");
    expect(session.avatarUrl).toBe("https://example.test/avatar.png");
    expect(getActiveAppSession()).toEqual(session);
  });

  it("creates accounts with a trimmed username and stores the updated profile", async () => {
    const user = createUser({ displayName: undefined });
    createUserWithEmailAndPassword.mockResolvedValue({ user });
    updateProfile.mockImplementation(async (_user, profile) => {
      Object.defineProperty(user, "displayName", {
        configurable: true,
        value: profile.displayName,
      });
    });

    const session = await authenticateWithEmailPassword(auth, "register", {
      email: "lera@example.com",
      password: "Secret1!",
      username: "  Lera  ",
    });

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      "lera@example.com",
      "Secret1!",
    );
    expect(updateProfile).toHaveBeenCalledWith(user, { displayName: "Lera" });
    expect(session.displayName).toBe("Lera");
  });

  it("signs out the new Firebase identity if registration data is missing", async () => {
    createUserWithEmailAndPassword.mockResolvedValue({ user: createUser() });

    await expect(
      authenticateWithEmailPassword(auth, "register", {
        email: "lera@example.com",
        password: "Secret1!",
      }),
    ).rejects.toThrow("A registration username is required.");
    expect(signOut).toHaveBeenCalledWith(auth);
    expect(getActiveAppSession()).toBeUndefined();
  });

  it("preserves the authentication and cleanup errors when sign-out also fails", async () => {
    const user = createUser({ email: undefined });
    signInWithEmailAndPassword.mockResolvedValue({ user });
    signOut.mockRejectedValue(new Error("Firebase sign-out failed"));

    await expect(
      authenticateWithEmailPassword(auth, "login", {
        email: "lera@example.com",
        password: "secret",
      }),
    ).rejects.toBeInstanceOf(AuthenticationCleanupError);
  });
});
