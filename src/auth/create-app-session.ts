import type { User } from "firebase/auth";
import type { AppSession } from "./app-session";
import { saveAppSession } from "./app-session-storage";

export const createAppSession = (user: User): AppSession => {
  if (!user.email) throw new Error("The authenticated user has no email.");

  const emailName: string = user.email.split("@", 1)[0] ?? "";
  const session: AppSession = {
    displayName: user.displayName?.trim() || emailName || "Player",
    email: user.email,
    authenticatedAt: Date.now(),
    ...(user.photoURL && { avatarUrl: user.photoURL }),
  };

  saveAppSession(session);
  return session;
};
