import { getAuthFieldError } from "./auth-validation";
import type { AuthMode } from "./auth-types";

export const setupAuthFormValidation = (
  form: HTMLFormElement,
  mode: AuthMode,
): void => {
  const fields: HTMLInputElement[] = [
    ...form.querySelectorAll<HTMLInputElement>("input"),
  ];
  const password: HTMLInputElement | null =
    form.querySelector("#auth-password");
  const submit: HTMLButtonElement | null = form.querySelector(
    ".auth-dialog__submit",
  );
  const touchedFields: Set<string> = new Set();

  const getError = (field: HTMLInputElement): string =>
    getAuthFieldError(field, mode, password?.value);

  const updateField = (field: HTMLInputElement): void => {
    const error: string = getError(field);
    const message: HTMLElement | null = form.querySelector(
      `#auth-${CSS.escape(field.name)}-error`,
    );

    field.setAttribute("aria-invalid", String(Boolean(error)));
    field
      .closest(".auth-dialog__input")
      ?.classList.toggle("auth-dialog__input--invalid", Boolean(error));
    if (!message) return;
    message.textContent = error;
    message.hidden = !error;
  };

  const updateSubmitState = (): void => {
    for (const field of fields) {
      field.setCustomValidity(getError(field));
    }
    if (submit) submit.disabled = !form.checkValidity();
  };

  const validateField = (field: HTMLInputElement): void => {
    touchedFields.add(field.name);
    updateField(field);

    if (field.name === "password") {
      const confirmation: HTMLInputElement | undefined = fields.find(
        (candidate: HTMLInputElement): boolean =>
          candidate.name === "confirm-password",
      );
      if (confirmation) updateField(confirmation);
    }

    updateSubmitState();
  };

  for (const field of fields) {
    const onFieldChange = (): void => validateField(field);
    field.addEventListener("input", onFieldChange);
    field.addEventListener("change", onFieldChange);
    field.addEventListener("blur", onFieldChange);
  }

  form.addEventListener("submit", (event: SubmitEvent): void => {
    event.preventDefault();
    for (const field of fields) {
      touchedFields.add(field.name);
      updateField(field);
    }
    updateSubmitState();
  });
};
