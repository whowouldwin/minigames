import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { createAppSession } from "./app-session";
import type { AppSession } from "./app-session";
import {
  AuthenticationCleanupError,
  AuthenticationNotConfiguredError,
} from "./auth-errors";

const signOutAfterFailure = async (
  auth: Auth,
  authenticationError: unknown,
): Promise<void> => {
  try {
    await signOut(auth);
  } catch (cleanupError: unknown) {
    throw new AuthenticationCleanupError(authenticationError, cleanupError);
  }
};

export const authenticateWithGoogle = async (
  auth: Auth | undefined,
): Promise<AppSession> => {
  if (!auth) throw new AuthenticationNotConfiguredError();

  const provider: GoogleAuthProvider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  try {
    return createAppSession(result.user);
  } catch (error: unknown) {
    await signOutAfterFailure(auth, error);
    throw error;
  }
};
