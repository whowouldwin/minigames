export class AuthenticationNotConfiguredError extends Error {
  constructor() {
    super("Firebase Authentication is not configured.");
    this.name = "AuthenticationNotConfiguredError";
  }
}

export class AuthenticationCleanupError extends AggregateError {
  constructor(authenticationError: unknown, cleanupError: unknown) {
    super(
      [authenticationError, cleanupError],
      "Authentication failed and Firebase sign-out cleanup also failed.",
    );
    this.name = "AuthenticationCleanupError";
  }
}

const firebaseAuthErrorMessages: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/network-request-failed":
    "Connection failed. Check your internet and try again.",
  "auth/operation-not-allowed":
    "Email and password authentication is unavailable.",
  "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
  "auth/user-disabled": "This account is disabled.",
  "auth/user-not-found": "Email or password is incorrect.",
  "auth/weak-password": "Choose a stronger password.",
  "auth/wrong-password": "Email or password is incorrect.",
};

const fallbackMessage: string = "Authentication failed. Please try again.";

export const getAuthenticationErrorMessage = (error: unknown): string => {
  if (error instanceof AuthenticationCleanupError) {
    return "Authentication could not be completed. Please try again.";
  }

  if (error instanceof AuthenticationNotConfiguredError) {
    return "Authentication is not configured. Please try again later.";
  }

  if (typeof error !== "object" || error === null) return fallbackMessage;

  const code: unknown = (error as { code?: unknown }).code;
  return typeof code === "string"
    ? (firebaseAuthErrorMessages[code] ?? fallbackMessage)
    : fallbackMessage;
};
