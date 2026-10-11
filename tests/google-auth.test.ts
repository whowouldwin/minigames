import { beforeEach, describe, expect, it, vi } from "vitest";

const { signInWithPopup, signOut, createAppSession } = vi.hoisted(() => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  createAppSession: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: class GoogleAuthProvider {},
  signInWithPopup,
  signOut,
}));
vi.mock("../src/auth/create-app-session", () => ({ createAppSession }));

import { authenticateWithGoogle } from "../src/auth/google-auth";
import {
  AuthenticationCleanupError,
  AuthenticationNotConfiguredError,
} from "../src/auth/auth-errors";

describe("Google authentication", () => {
  beforeEach(() => {
    signInWithPopup.mockReset();
    signOut.mockReset();
    createAppSession.mockReset();
  });

  it("creates the app session from the successful Firebase user", async () => {
    const auth = {} as never;
    const user = { email: "lera@example.com" };
    const session = {
      email: user.email,
      displayName: "Lera",
      authenticatedAt: 1,
    };
    signInWithPopup.mockResolvedValue({ user });
    createAppSession.mockReturnValue(session);

    await expect(authenticateWithGoogle(auth)).resolves.toBe(session);
    expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.anything());
    expect(createAppSession).toHaveBeenCalledWith(user);
    expect(signOut).not.toHaveBeenCalled();
  });

  it("rejects missing Firebase config and signs out if app-session creation fails", async () => {
    await expect(authenticateWithGoogle(undefined)).rejects.toBeInstanceOf(
      AuthenticationNotConfiguredError,
    );
    const auth = {} as never;
    signInWithPopup.mockResolvedValue({ user: { email: undefined } });
    createAppSession.mockImplementation(() => {
      throw new Error("invalid user");
    });
    signOut.mockResolvedValue(undefined);
    await expect(authenticateWithGoogle(auth)).rejects.toThrow("invalid user");
    expect(signOut).toHaveBeenCalledWith(auth);

    signOut.mockRejectedValue(new Error("sign out failed"));
    await expect(authenticateWithGoogle(auth)).rejects.toBeInstanceOf(
      AuthenticationCleanupError,
    );
  });
});
