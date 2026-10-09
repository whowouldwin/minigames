import type { User } from "firebase/auth";

export const APP_SESSION_STORAGE_KEY: string =
  "minigames:whowouldwin-minigames:app-session";

export interface AppSession {
  displayName: string;
  email: string;
  authenticatedAt: number;
  avatarUrl?: string;
}

class AppSessionStore {
  private activeSession: AppSession | undefined;

  create(user: User): AppSession {
    if (!user.email) throw new Error("The authenticated user has no email.");

    const emailName: string = user.email.split("@", 1)[0] ?? "";
    const displayName: string =
      user.displayName?.trim() || emailName || "Player";
    const session: AppSession = {
      displayName,
      email: user.email,
      authenticatedAt: Date.now(),
      ...(user.photoURL && { avatarUrl: user.photoURL }),
    };

    globalThis.localStorage.setItem(
      APP_SESSION_STORAGE_KEY,
      JSON.stringify(session),
    );
    this.activeSession = session;

    return session;
  }

  getActive(): AppSession | undefined {
    return this.activeSession;
  }
}

const appSessionStore = new AppSessionStore();

export const createAppSession = (user: User): AppSession =>
  appSessionStore.create(user);

export const getActiveAppSession = (): AppSession | undefined =>
  appSessionStore.getActive();
