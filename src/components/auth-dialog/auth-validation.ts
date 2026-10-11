import type { AuthMode } from "./auth-types";

export const getAuthFieldError = (
  field: HTMLInputElement,
  mode: AuthMode,
  passwordValue: string | undefined,
): string => {
  if (field.validity.valueMissing) return "This field is required.";

  switch (field.name) {
    case "email": {
      return field.validity.typeMismatch ? "Enter a valid email address." : "";
    }
    case "username": {
      if (field.value.length < 2 || field.value.length > 30) {
        return "Username must be 2–30 characters long.";
      }
      return field.validity.patternMismatch
        ? "Use English letters and digits, starting with an uppercase letter."
        : "";
    }
    case "password": {
      if (field.value.length < 6) {
        return "Password must be at least 6 characters long.";
      }
      return mode === "register" &&
        (!/[A-Z]/.test(field.value) ||
          !/\d/.test(field.value) ||
          !/[^A-Za-z0-9\s]/.test(field.value))
        ? "Use at least one uppercase letter, one number, and one special character."
        : "";
    }
    case "confirm-password": {
      return field.value === passwordValue ? "" : "Passwords do not match.";
    }
    default: {
      return "";
    }
  }
};
