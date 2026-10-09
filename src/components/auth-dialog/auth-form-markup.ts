import mailIcon from "../../assets/icons/mail.png";
import lockIcon from "../../assets/icons/lock.png";
import personIcon from "../../assets/icons/person.png";
import visibilityIcon from "../../assets/icons/visibility.png";
import googleIcon from "../../assets/icons/google.svg";
import type { AuthMode } from "./auth-types";

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

const getAuthFields = (mode: AuthMode): AuthField[] => {
  const isRegistration: boolean = mode === "register";
  const usernameField: AuthField[] = isRegistration
    ? [
        {
          name: "username",
          label: "Username",
          type: "text",
          placeholder: "e.g. GamerFox42",
          autocomplete: "nickname",
          icon: personIcon,
          minLength: 2,
          maxLength: 30,
          pattern: "[A-Z][A-Za-z0-9]*",
        },
      ]
    : [];
  const confirmationField: AuthField[] = isRegistration
    ? [
        {
          name: "confirm-password",
          label: "Confirm Password",
          type: "password",
          placeholder: "Repeat your password",
          autocomplete: "off",
          icon: lockIcon,
        },
      ]
    : [];

  return [
    ...usernameField,
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
    ...confirmationField,
  ];
};

const renderPasswordVisibilityButton = (): string => `
  <button class="auth-dialog__visibility" type="button" aria-label="Show password" aria-pressed="false">
    <img src="${visibilityIcon}" alt="" />
  </button>`;

const renderField = (
  field: AuthField,
  isPasswordVisibilityShown: boolean,
): string => {
  const minLength: string = field.minLength
    ? ` minlength="${field.minLength}"`
    : "";
  const maxLength: string = field.maxLength
    ? ` maxlength="${field.maxLength}"`
    : "";
  const pattern: string = field.pattern ? ` pattern="${field.pattern}"` : "";
  const visibilityButton: string = isPasswordVisibilityShown
    ? renderPasswordVisibilityButton()
    : "";

  return `
    <div class="auth-dialog__field">
      <label for="auth-${field.name}">${field.label}</label>
      <div class="auth-dialog__input">
        <img src="${field.icon}" alt="" />
        <input
          id="auth-${field.name}"
          name="${field.name}"
          type="${field.type}"
          placeholder="${field.placeholder}"
          autocomplete="${field.autocomplete}"
          required${minLength}${maxLength}${pattern}
          aria-describedby="auth-${field.name}-error"
          aria-invalid="false"
        />${visibilityButton}
      </div>
      <span class="auth-dialog__error" id="auth-${field.name}-error" aria-live="polite" hidden></span>
    </div>`;
};

const renderForgotPasswordButton = (mode: AuthMode): string =>
  mode === "login"
    ? '<button type="button" class="auth-dialog__link auth-dialog__forgot">Forgot Password?</button>'
    : "";

const renderFormActions = (mode: AuthMode): string => {
  const submitLabel: string = mode === "register" ? "Create Account" : "Login";
  const googleLabel: string =
    mode === "register" ? "Sign up with Google" : "Continue with Google";

  return `
    <div class="auth-dialog__actions">
      <button class="auth-dialog__submit" type="submit" disabled>${submitLabel}</button>
      <div class="auth-dialog__divider">OR</div>
      <button type="button" class="auth-dialog__google">
        <img src="${googleIcon}" alt="" />${googleLabel}
      </button>
    </div>`;
};

const renderModeSwitch = (mode: AuthMode): string => {
  const prompt: string =
    mode === "register" ? "Already have an account?" : "Don't have an account?";
  const label: string = mode === "register" ? "Login" : "Register";

  return `
    <p class="auth-dialog__footer">
      ${prompt}
      <button type="button" class="auth-dialog__link auth-dialog__switch">${label}</button>
    </p>`;
};

export const renderAuthFormMarkup = (mode: AuthMode): string => {
  const isRegistration: boolean = mode === "register";
  const heading: string = isRegistration ? "Create Account" : "Welcome Back!";
  const description: string = isRegistration
    ? "Join MiniGames to track your score &amp; streak."
    : "Sign in to resume your games and progress.";
  const fields: string = getAuthFields(mode)
    .map((field: AuthField): string =>
      renderField(field, !isRegistration && field.name === "password"),
    )
    .join("");

  return `
    <div class="auth-dialog__heading">
      <h2 id="auth-title">${heading}</h2>
      <p>${description}</p>
    </div>
    <p class="auth-dialog__form-status" role="alert" hidden></p>
    <div class="auth-dialog__fields">
      ${fields}
      ${renderForgotPasswordButton(mode)}
    </div>
    ${renderFormActions(mode)}
    ${renderModeSwitch(mode)}`;
};
