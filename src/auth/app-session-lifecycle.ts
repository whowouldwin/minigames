import { signOut } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { APP_SESSION_DURATION_MS } from "./app-session";
import { clearAppSession, restoreAppSession } from "./app-session-storage";
import type { AppSession } from "./app-session";

export interface AppSessionLifecycle {
  restore: () => AppSession | undefined;
  check: () => AppSession | undefined;
  activate: (session: AppSession) => void;
}

type SessionEndReason = "expired" | "invalid";

export const createAppSessionLifecycle = (
  auth: Auth | undefined,
  onSessionEnd: (reason: SessionEndReason) => void,
): AppSessionLifecycle => {
  let activeSession: AppSession | undefined;
  let expirationTimer: number | undefined;

  const stopExpirationTimer = (): void => {
    if (expirationTimer === undefined) return;
    globalThis.clearTimeout(expirationTimer);
    expirationTimer = undefined;
  };

  const signOutFirebase = (): void => {
    if (!auth) return;
    void signOut(auth).catch((): undefined => undefined);
  };

  const endSession = (reason: SessionEndReason): void => {
    stopExpirationTimer();
    activeSession = undefined;
    clearAppSession();
    signOutFirebase();
    onSessionEnd(reason);
  };

  const scheduleExpiration = (session: AppSession): void => {
    stopExpirationTimer();
    const timeUntilExpiration: number =
      session.authenticatedAt + APP_SESSION_DURATION_MS - Date.now();
    expirationTimer = globalThis.setTimeout(
      (): void => {
        check();
      },
      Math.max(timeUntilExpiration, 0),
    );
  };

  const check = (): AppSession | undefined => {
    const result = restoreAppSession();
    if (result.status === "restored") {
      activeSession = result.session;
      scheduleExpiration(result.session);
      return result.session;
    }

    if (result.status === "expired" || result.status === "invalid") {
      endSession(result.status);
    } else if (activeSession) {
      endSession("invalid");
    }

    return undefined;
  };

  return {
    restore: (): AppSession | undefined => check(),
    check,
    activate: (session: AppSession): void => {
      activeSession = session;
      scheduleExpiration(session);
    },
  };
};
