import { APP_SESSION_DURATION_MS } from "./app-session";
import type { AppSession } from "./app-session";

export const APP_SESSION_STORAGE_KEY: string =
  "minigames:whowouldwin-minigames:app-session";

export type AppSessionRestoreResult =
  | { status: "missing" }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "restored"; session: AppSession };

const isAppSession = (value: unknown): value is AppSession => {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;

  const session = value as Record<string, unknown>;
  const allowedFields: Set<string> = new Set([
    "displayName",
    "email",
    "authenticatedAt",
    "avatarUrl",
  ]);

  return (
    Object.keys(session).every((field: string): boolean =>
      allowedFields.has(field),
    ) &&
    typeof session.displayName === "string" &&
    session.displayName.trim().length > 0 &&
    typeof session.email === "string" &&
    session.email.trim().length > 0 &&
    typeof session.authenticatedAt === "number" &&
    Number.isSafeInteger(session.authenticatedAt) &&
    session.authenticatedAt >= 0 &&
    session.authenticatedAt <= Date.now() &&
    (session.avatarUrl === undefined ||
      (typeof session.avatarUrl === "string" && session.avatarUrl.length > 0))
  );
};

class AppSessionStorage {
  private activeSession: AppSession | undefined;

  private readStoredValue():
    { status: "missing" | "invalid" } | { status: "stored"; value: string } {
    try {
      const value: string | null = globalThis.localStorage.getItem(
        APP_SESSION_STORAGE_KEY,
      );
      return value === null
        ? { status: "missing" }
        : { status: "stored", value };
    } catch {
      this.activeSession = undefined;
      return { status: "invalid" };
    }
  }

  private parseSession(value: string): AppSession | undefined {
    try {
      const parsed: unknown = JSON.parse(value) as unknown;
      return isAppSession(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }

  private isExpired(session: AppSession): boolean {
    return Date.now() - session.authenticatedAt >= APP_SESSION_DURATION_MS;
  }

  clear(): void {
    this.activeSession = undefined;
    try {
      globalThis.localStorage.removeItem(APP_SESSION_STORAGE_KEY);
    } catch {
      return;
    }
  }

  restore(): AppSessionRestoreResult {
    const storedValue = this.readStoredValue();
    if (storedValue.status !== "stored") return storedValue;

    const parsedSession = this.parseSession(storedValue.value);
    if (!parsedSession) {
      this.clear();
      return { status: "invalid" };
    }

    if (this.isExpired(parsedSession)) {
      this.clear();
      return { status: "expired" };
    }

    const session: AppSession = {
      displayName: parsedSession.displayName,
      email: parsedSession.email,
      authenticatedAt: parsedSession.authenticatedAt,
      ...(parsedSession.avatarUrl && { avatarUrl: parsedSession.avatarUrl }),
    };
    this.activeSession = session;
    return { status: "restored", session };
  }

  save(session: AppSession): void {
    globalThis.localStorage.setItem(
      APP_SESSION_STORAGE_KEY,
      JSON.stringify(session),
    );
    this.activeSession = session;
  }

  getActive(): AppSession | undefined {
    return this.activeSession;
  }
}

const appSessionStorage = new AppSessionStorage();

export const clearAppSession = (): void => appSessionStorage.clear();

export const restoreAppSession = (): AppSessionRestoreResult =>
  appSessionStorage.restore();

export const saveAppSession = (session: AppSession): void =>
  appSessionStorage.save(session);

export const getActiveAppSession = (): AppSession | undefined =>
  appSessionStorage.getActive();
