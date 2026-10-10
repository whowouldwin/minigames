export { APP_SESSION_DURATION_MS } from "./app-session";
export type { AppSession } from "./app-session";
export { createAppSession } from "./create-app-session";
export {
  APP_SESSION_STORAGE_KEY,
  clearAppSession,
  getActiveAppSession,
  restoreAppSession,
} from "./app-session-storage";
export type { AppSessionRestoreResult } from "./app-session-storage";
export { createAppSessionLifecycle } from "./app-session-lifecycle";
export type { AppSessionLifecycle } from "./app-session-lifecycle";
export {
  AuthenticationCleanupError,
  AuthenticationNotConfiguredError,
  getAuthenticationErrorMessage,
} from "./auth-errors";
export { authenticateWithEmailPassword } from "./email-password-auth";
export { authenticateWithGoogle } from "./google-auth";
export type {
  EmailPasswordCredentials,
  EmailPasswordMode,
} from "./email-password-auth";
