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
  const password: HTMLInputElement | null =
    form.querySelector("#auth-password");
  const visibilityButton: HTMLButtonElement | null = form.querySelector(
    ".auth-dialog__visibility",
  );

  if (!password || !visibilityButton) return;

  visibilityButton.addEventListener("click", (): void => {
    const isVisible: boolean = password.type === "password";
    password.type = isVisible ? "text" : "password";
    visibilityButton.setAttribute("aria-pressed", String(isVisible));
    visibilityButton.setAttribute(
      "aria-label",
      isVisible ? "Hide password" : "Show password",
    );
  });
};

export const setupAuthFormControls = (
  form: HTMLFormElement,
  mode: AuthMode,
  switchMode: (mode: AuthMode) => void,
): void => {
  setupModeSwitch(form, mode, switchMode);
  setupPasswordVisibility(form);
};
