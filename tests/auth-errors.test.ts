import { describe, expect, it } from "vitest";
import {
  AuthenticationCleanupError,
  AuthenticationNotConfiguredError,
  getAuthenticationErrorMessage,
} from "../src/auth/auth-errors";

describe("authentication error messages", () => {
  it("maps known Firebase codes to user-facing messages", () => {
    expect(
      getAuthenticationErrorMessage({ code: "auth/invalid-credential" }),
    ).toBe("Email or password is incorrect.");
    expect(getAuthenticationErrorMessage({ code: "auth/popup-blocked" })).toBe(
      "The sign-in window was blocked. Allow pop-ups and try again.",
    );
  });

  it("uses safe fallback messages for unknown errors", () => {
    expect(getAuthenticationErrorMessage({ code: "auth/unknown" })).toBe(
      "Authentication failed. Please try again.",
    );
    expect(getAuthenticationErrorMessage("secret backend details")).toBe(
      "Authentication failed. Please try again.",
    );
  });

  it("distinguishes missing configuration from cleanup failures", () => {
    const cleanupError = new AuthenticationCleanupError(
      new Error("auth failed"),
      new Error("sign-out failed"),
    );

    expect(
      getAuthenticationErrorMessage(new AuthenticationNotConfiguredError()),
    ).toBe("Authentication is not configured. Please try again later.");
    expect(getAuthenticationErrorMessage(cleanupError)).toBe(
      "Authentication could not be completed. Please try again.",
    );
  });
});
