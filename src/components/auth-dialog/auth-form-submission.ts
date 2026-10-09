import type { EmailPasswordCredentials } from "../../auth";
import type { AuthMode } from "./auth-types";

interface AuthFormSubmissionOptions {
  form: HTMLFormElement;
  mode: AuthMode;
  tabs: HTMLElement;
  closeButton: HTMLButtonElement;
  authenticate: (
    mode: AuthMode,
    credentials: EmailPasswordCredentials,
  ) => Promise<void>;
  onPendingChange: (isPending: boolean) => void;
}

export const setupAuthFormSubmission = ({
  form,
  mode,
  tabs,
  closeButton,
  authenticate,
  onPendingChange,
}: AuthFormSubmissionOptions): void => {
  let isPending: boolean = false;

  form.addEventListener("submit", (event: SubmitEvent): void => {
    event.preventDefault();
    if (isPending || !form.checkValidity()) return;

    const values: FormData = new FormData(form);
    const credentials: EmailPasswordCredentials = {
      email: String(values.get("email") ?? "").trim(),
      password: String(values.get("password") ?? ""),
      ...(mode === "register" && {
        username: String(values.get("username") ?? "").trim(),
      }),
    };
    const status: HTMLElement | null = form.querySelector(
      ".auth-dialog__form-status",
    );
    const submit: HTMLButtonElement | null = form.querySelector(
      ".auth-dialog__submit",
    );
    const inputs: HTMLInputElement[] = [
      ...form.querySelectorAll<HTMLInputElement>("input"),
    ];

    isPending = true;
    onPendingChange(true);
    for (const input of inputs) input.disabled = true;
    for (const button of form.querySelectorAll<HTMLButtonElement>("button"))
      button.disabled = true;
    for (const tab of tabs.querySelectorAll<HTMLButtonElement>("button"))
      tab.disabled = true;
    closeButton.disabled = true;
    if (submit) submit.textContent = "Please wait…";
    if (status) {
      status.hidden = true;
      status.textContent = "";
    }

    void authenticate(mode, credentials)
      .catch((error: unknown): void => {
        if (!status) return;
        status.textContent =
          error instanceof Error
            ? error.message
            : "Authentication failed. Please try again.";
        status.hidden = false;
      })
      .finally((): void => {
        isPending = false;
        onPendingChange(false);
        for (const input of inputs) input.disabled = false;
        for (const button of form.querySelectorAll<HTMLButtonElement>("button"))
          button.disabled = false;
        for (const tab of tabs.querySelectorAll<HTMLButtonElement>("button"))
          tab.disabled = false;
        closeButton.disabled = false;
        if (!submit) return;
        submit.textContent = mode === "register" ? "Create Account" : "Login";
        submit.disabled = !form.checkValidity();
      });
  });
};
