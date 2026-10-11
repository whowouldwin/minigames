import { setupAuthFormValidation } from "./auth-form-validation";
import { setupAuthFormControls } from "./auth-form-controls";
import { renderAuthFormMarkup } from "./auth-form-markup";
import type { AuthMode } from "./auth-types";

export type { AuthMode } from "./auth-types";

export const createAuthForm = (
  mode: AuthMode,
  switchMode: (mode: AuthMode) => void,
): HTMLFormElement => {
  const form: HTMLFormElement = document.createElement("form");
  form.className = "auth-dialog__form";
  form.noValidate = true;
  form.setAttribute("aria-labelledby", "auth-title");
  form.innerHTML = renderAuthFormMarkup(mode);

  setupAuthFormValidation(form, mode);
  setupAuthFormControls(form, mode, switchMode);

  return form;
};
