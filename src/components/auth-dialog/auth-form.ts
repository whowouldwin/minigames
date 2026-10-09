import mailIcon from "../../assets/icons/mail.png";
import lockIcon from "../../assets/icons/lock.png";
import personIcon from "../../assets/icons/person.png";
import visibilityIcon from "../../assets/icons/visibility.png";
import googleIcon from "../../assets/icons/google.svg";
import { setupAuthFormValidation } from "./auth-form-validation";
import type { AuthMode } from "./auth-types";

export type { AuthMode } from "./auth-types";

interface AuthField {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  autocomplete: string;
  icon: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export const createAuthForm = (
  mode: AuthMode,
  switchMode: (mode: AuthMode) => void,
): HTMLFormElement => {
  const isRegistration: boolean = mode === "register";
  const form: HTMLFormElement = document.createElement("form");
  form.className = "auth-dialog__form";
  form.noValidate = true;
  form.setAttribute("aria-labelledby", "auth-title");
  const fields: AuthField[] = [
    ...(isRegistration
      ? [
          {
            name: "username",
            label: "Username",
            type: "text" as const,
            placeholder: "e.g. GamerFox42",
            autocomplete: "username",
            icon: personIcon,
            minLength: 2,
            maxLength: 30,
            pattern: "[A-Z][A-Za-z0-9]*",
          },
        ]
      : []),
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: isRegistration
        ? "your.email@domain.com"
        : "e.g. alex@minigames.com",
      autocomplete: "email",
      icon: mailIcon,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: isRegistration ? "Min. 6 characters" : "••••••••",
      autocomplete: isRegistration ? "new-password" : "current-password",
      icon: lockIcon,
      minLength: 6,
    },
    ...(isRegistration
      ? [
          {
            name: "confirm-password",
            label: "Confirm Password",
            type: "password" as const,
            placeholder: "Repeat your password",
            autocomplete: "new-password",
            icon: lockIcon,
          },
        ]
      : []),
  ];

  form.innerHTML = `
    <div class="auth-dialog__heading"><h2 id="auth-title">${isRegistration ? "Create Account" : "Welcome Back!"}</h2><p>${isRegistration ? "Join MiniGames to track your score &amp; streak." : "Sign in to resume your games and progress."}</p></div>
    <div class="auth-dialog__fields">${fields
      .map(
        (field: AuthField): string => `
      <div class="auth-dialog__field"><label for="auth-${field.name}">${field.label}</label>
        <div class="auth-dialog__input"><img src="${field.icon}" alt="" /><input id="auth-${field.name}" name="${field.name}" type="${field.type}" placeholder="${field.placeholder}" autocomplete="${field.autocomplete}" required${field.minLength ? ` minlength="${field.minLength}"` : ""}${field.maxLength ? ` maxlength="${field.maxLength}"` : ""}${field.pattern ? ` pattern="${field.pattern}"` : ""} aria-describedby="auth-${field.name}-error" aria-invalid="false" />${!isRegistration && field.name === "password" ? `<button class="auth-dialog__visibility" type="button" aria-label="Show password" aria-pressed="false"><img src="${visibilityIcon}" alt="" /></button>` : ""}</div>
        <span class="auth-dialog__error" id="auth-${field.name}-error" aria-live="polite" hidden></span>
      </div>`,
      )
      .join(
        "",
      )}${isRegistration ? "" : '<button type="button" class="auth-dialog__link auth-dialog__forgot">Forgot Password?</button>'}
    </div>
    <div class="auth-dialog__actions"><button class="auth-dialog__submit" type="submit" disabled>${isRegistration ? "Create Account" : "Login"}</button><div class="auth-dialog__divider">OR</div><button type="button" class="auth-dialog__google"><img src="${googleIcon}" alt="" />${isRegistration ? "Sign up with Google" : "Continue with Google"}</button></div>
    <p class="auth-dialog__footer">${isRegistration ? "Already have an account?" : "Don't have an account?"} <button type="button" class="auth-dialog__link auth-dialog__switch">${isRegistration ? "Login" : "Register"}</button></p>`;
  setupAuthFormValidation(form, mode);

  const password: HTMLInputElement | null =
    form.querySelector("#auth-password");
  form
    .querySelector(".auth-dialog__switch")
    ?.addEventListener("click", (): void => {
      switchMode(isRegistration ? "login" : "register");
    });
  const visibility: HTMLButtonElement | null = form.querySelector(
    ".auth-dialog__visibility",
  );
  visibility?.addEventListener("click", (): void => {
    if (!password) return;
    const isVisible: boolean = password.type === "password";
    password.type = isVisible ? "text" : "password";
    visibility.setAttribute("aria-pressed", String(isVisible));
    visibility.setAttribute(
      "aria-label",
      isVisible ? "Hide password" : "Show password",
    );
  });

  return form;
};
