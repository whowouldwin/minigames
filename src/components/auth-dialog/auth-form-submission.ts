import { getAuthenticationErrorMessage } from "../../auth";
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
  authenticateWithGoogle: () => Promise<void>;
  onSuccess: () => void;
  onPendingChange: (isPending: boolean) => void;
}

const setButtonLabel = (button: HTMLButtonElement, label: string): void => {
  const text: HTMLSpanElement | null = button.querySelector("span");
  if (text) text.textContent = label;
  else button.textContent = label;
};

export const setupAuthFormSubmission = ({
  form,
  mode,
  tabs,
  closeButton,
  authenticate,
  authenticateWithGoogle,
  onSuccess,
  onPendingChange,
}: AuthFormSubmissionOptions): void => {
  let isPending: boolean = false;
  const status: HTMLElement | null = form.querySelector(
    ".auth-dialog__form-status",
  );
  const submit: HTMLButtonElement | null = form.querySelector(
    ".auth-dialog__submit",
  );
  const googleButton: HTMLButtonElement | null = form.querySelector(
    ".auth-dialog__google",
  );

  const runAuthentication = (
    action: () => Promise<void>,
    pendingButton: HTMLButtonElement,
    pendingLabel: string,
    idleLabel: string,
  ): void => {
    if (isPending) return;

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
    setButtonLabel(pendingButton, pendingLabel);
    if (status) {
      status.hidden = true;
      status.textContent = "";
    }

    let wasSuccessful: boolean = false;
    void action()
      .then((): void => {
        wasSuccessful = true;
      })
      .catch((error: unknown): void => {
        if (!status) return;
        status.textContent = getAuthenticationErrorMessage(error);
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
        setButtonLabel(pendingButton, idleLabel);
        if (submit) submit.disabled = !form.checkValidity();
        if (wasSuccessful) onSuccess();
      });
  };

  form.addEventListener("submit", (event: SubmitEvent): void => {
    event.preventDefault();
    if (isPending || !submit || !form.checkValidity()) return;

    const values: FormData = new FormData(form);
    const credentials: EmailPasswordCredentials = {
      email: String(values.get("email") ?? "").trim(),
      password: String(values.get("password") ?? ""),
      ...(mode === "register" && {
        username: String(values.get("username") ?? "").trim(),
      }),
    };
    runAuthentication(
      (): Promise<void> => authenticate(mode, credentials),
      submit,
      "Please wait…",
      mode === "register" ? "Create Account" : "Login",
    );
  });

  googleButton?.addEventListener("click", (): void => {
    runAuthentication(
      authenticateWithGoogle,
      googleButton,
      "Connecting to Google…",
      mode === "register" ? "Sign up with Google" : "Continue with Google",
    );
  });
};
