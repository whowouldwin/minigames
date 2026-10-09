import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import type { Auth, User } from "firebase/auth";
import { createAppSession } from "./app-session";
import type { AppSession } from "./app-session";

export type EmailPasswordMode = "login" | "register";

export interface EmailPasswordCredentials {
  email: string;
  password: string;
  username?: string;
}

export class AuthenticationNotConfiguredError extends Error {
  constructor() {
    super("Firebase Authentication is not configured.");
    this.name = "AuthenticationNotConfiguredError";
  }
}

const signOutAfterFailure = async (auth: Auth): Promise<void> => {
  try {
    await signOut(auth);
  } catch {
    // Firebase identity must not become the app's source of truth by itself.
  }
};

export const authenticateWithEmailPassword = async (
  auth: Auth | undefined,
  mode: EmailPasswordMode,
  credentials: EmailPasswordCredentials,
): Promise<AppSession> => {
  if (!auth) throw new AuthenticationNotConfiguredError();

  const authenticationResult =
    mode === "login"
      ? await signInWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password,
        )
      : await createUserWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password,
        );
  const user: User = authenticationResult.user;

  try {
    if (mode === "register") {
      const username: string = credentials.username?.trim() ?? "";
      if (!username) throw new Error("A registration username is required.");
      await updateProfile(user, { displayName: username });
    }

    return createAppSession(user);
  } catch (error: unknown) {
    await signOutAfterFailure(auth);
    throw error;
  }
};
