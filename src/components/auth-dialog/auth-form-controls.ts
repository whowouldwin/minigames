import type { AuthMode } from "./auth-types";

const setupModeSwitch = (
  form: HTMLFormElement,
  mode: AuthMode,
  switchMode: (mode: AuthMode) => void,
): void => {
  const switchButton: HTMLButtonElement | null = form.querySelector(
    ".auth-dialog__switch",
  );
  switchButton?.addEventListener("click", (): void => {
    switchMode(mode === "register" ? "login" : "register");
  });
};

const setupPasswordVisibility = (form: HTMLFormElement): void => {
  const visibilityButtons: HTMLButtonElement[] = [
    ...form.querySelectorAll<HTMLButtonElement>(".auth-dialog__visibility"),
  ];

  for (const visibilityButton of visibilityButtons) {
    const passwordId: string =
      visibilityButton.getAttribute("aria-controls") ?? "";
    const password: HTMLInputElement | undefined = passwordId
      ? (form.querySelector<HTMLInputElement>(`#${CSS.escape(passwordId)}`) ??
        undefined)
      : undefined;

    if (!password) continue;

    visibilityButton.addEventListener("click", (): void => {
      const isVisible: boolean = password.type === "password";
      password.type = isVisible ? "text" : "password";
      visibilityButton.setAttribute("aria-pressed", String(isVisible));
      visibilityButton.setAttribute(
        "aria-label",
        isVisible ? "Hide password" : "Show password",
      );
    });
  }
};

export const setupAuthFormControls = (
  form: HTMLFormElement,
  mode: AuthMode,
  switchMode: (mode: AuthMode) => void,
): void => {
  setupModeSwitch(form, mode, switchMode);
  setupPasswordVisibility(form);
};
