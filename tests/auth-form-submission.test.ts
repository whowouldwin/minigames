import { afterEach, describe, expect, it, vi } from "vitest";
import type { EmailPasswordCredentials } from "../src/auth/email-password-auth";
import type { AuthMode } from "../src/components/auth-dialog/auth-types";
import { setupAuthFormSubmission } from "../src/components/auth-dialog/auth-form-submission";

interface SubmissionFixture {
  form: HTMLFormElement;
  tabs: HTMLElement;
  closeButton: HTMLButtonElement;
  submit: HTMLButtonElement;
  google: HTMLButtonElement;
  status: HTMLElement;
  setPending: ReturnType<typeof vi.fn>;
  onSuccess: ReturnType<typeof vi.fn>;
  authenticate: ReturnType<typeof vi.fn>;
  authenticateWithGoogle: ReturnType<typeof vi.fn>;
}

const createFixture = (mode: AuthMode): SubmissionFixture => {
  const form = document.createElement("form");
  form.innerHTML = `
    <input name="email" type="email" required value="lera@example.com">
    <input name="password" required value="Secret1!">
    ${mode === "register" ? '<input name="username" required value="Lera">' : ""}
    <button class="auth-dialog__submit" type="submit"><span>${mode === "register" ? "Create Account" : "Login"}</span></button>
    <button class="auth-dialog__google" type="button"><span>${mode === "register" ? "Sign up with Google" : "Continue with Google"}</span></button>
    <p class="auth-dialog__form-status" hidden></p>
  `;
  const tabs = document.createElement("div");
  tabs.innerHTML =
    '<button type="button">Login</button><button type="button">Register</button>';
  const closeButton = document.createElement("button");
  const setPending = vi.fn();
  const onSuccess = vi.fn();
  const authenticate = vi.fn().mockResolvedValue(undefined);
  const authenticateWithGoogle = vi.fn().mockResolvedValue(undefined);
  const submit = form.querySelector<HTMLButtonElement>(".auth-dialog__submit");
  const google = form.querySelector<HTMLButtonElement>(".auth-dialog__google");
  const status = form.querySelector<HTMLElement>(".auth-dialog__form-status");
  if (!submit || !google || !status)
    throw new Error("The authentication form fixture is incomplete.");

  setupAuthFormSubmission({
    form,
    mode,
    tabs,
    closeButton,
    authenticate,
    authenticateWithGoogle,
    onSuccess,
    onPendingChange: setPending,
  });

  return {
    form,
    tabs,
    closeButton,
    submit,
    google,
    status,
    setPending,
    onSuccess,
    authenticate,
    authenticateWithGoogle,
  };
};

const flushAsyncWork = async (): Promise<void> => {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
};

describe("auth form submission", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits trimmed credentials and restores controls after success", async () => {
    const fixture = createFixture("register");
    const email =
      fixture.form.querySelector<HTMLInputElement>('[name="email"]');
    const username =
      fixture.form.querySelector<HTMLInputElement>('[name="username"]');
    if (!email || !username) throw new Error("The form fields are missing.");
    email.value = "  lera@example.com  ";
    username.value = "  Lera  ";

    fixture.form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );

    expect(fixture.authenticate).toHaveBeenCalledWith("register", {
      email: "lera@example.com",
      password: "Secret1!",
      username: "Lera",
    } satisfies EmailPasswordCredentials);
    expect(fixture.submit.disabled).toBe(true);
    expect(fixture.setPending).toHaveBeenLastCalledWith(true);
    await flushAsyncWork();

    expect(fixture.submit.disabled).toBe(false);
    expect(fixture.closeButton.disabled).toBe(false);
    expect(fixture.onSuccess).toHaveBeenCalledOnce();
    expect(fixture.setPending).toHaveBeenLastCalledWith(false);
  });

  it("shows a safe error and keeps the form open after failure", async () => {
    const fixture = createFixture("login");
    fixture.authenticate.mockRejectedValue(new Error("Private backend detail"));
    fixture.form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    await flushAsyncWork();

    expect(fixture.status.hidden).toBe(false);
    expect(fixture.status.textContent).toBe(
      "Authentication failed. Please try again.",
    );
    expect(fixture.onSuccess).not.toHaveBeenCalled();
    expect(fixture.submit.disabled).toBe(false);
  });

  it("handles Google sign-in with its own pending label and callback", async () => {
    const fixture = createFixture("login");
    fixture.google.click();

    expect(fixture.google.disabled).toBe(true);
    expect(fixture.google.textContent).toBe("Connecting to Google…");
    expect(fixture.authenticateWithGoogle).toHaveBeenCalledOnce();
    await flushAsyncWork();

    expect(fixture.google.textContent).toBe("Continue with Google");
    expect(fixture.onSuccess).toHaveBeenCalledOnce();
  });

  it("does not authenticate an invalid form", () => {
    const fixture = createFixture("login");
    const email =
      fixture.form.querySelector<HTMLInputElement>('[name="email"]');
    if (!email) throw new Error("The email field is missing.");
    email.value = "invalid";
    fixture.form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );

    expect(fixture.authenticate).not.toHaveBeenCalled();
    expect(fixture.onSuccess).not.toHaveBeenCalled();
  });
});
