import { describe, expect, it } from "vitest";
import { getAuthFieldError } from "../src/components/auth-dialog/auth-validation";
import type { AuthMode } from "../src/components/auth-dialog/auth-types";

interface TestField {
  name: string;
  value: string;
  validity: {
    valueMissing: boolean;
    typeMismatch?: boolean;
    patternMismatch?: boolean;
  };
}

const createField = (
  name: string,
  value: string,
  validity?: TestField["validity"],
): HTMLInputElement =>
  ({
    name,
    value,
    validity: validity ?? { valueMissing: false },
  }) as HTMLInputElement;

const getError = (
  name: string,
  value: string,
  mode: AuthMode,
  passwordValue?: string,
  validity?: TestField["validity"],
): string =>
  getAuthFieldError(createField(name, value, validity), mode, passwordValue);

describe("getAuthFieldError", () => {
  it("requires a value before validating a field", () => {
    expect(
      getError("email", "", "login", undefined, { valueMissing: true }),
    ).toBe("This field is required.");
  });

  it("reports malformed email values", () => {
    expect(
      getError("email", "invalid", "login", undefined, {
        valueMissing: false,
        typeMismatch: true,
      }),
    ).toBe("Enter a valid email address.");
  });

  it("applies the password strength rule only during registration", () => {
    expect(getError("password", "simple1", "register")).toBe(
      "Use at least one uppercase letter, one number, and one special character.",
    );
    expect(getError("password", "simple1", "login")).toBe("");
  });

  it("requires the confirmation value to exactly match the password", () => {
    expect(
      getError("confirm-password", "Other1!", "register", "Secret1!"),
    ).toBe("Passwords do not match.");
    expect(
      getError("confirm-password", "Secret1!", "register", "Secret1!"),
    ).toBe("");
  });
});
