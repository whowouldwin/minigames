import { describe, expect, it, vi } from "vitest";
import { setupAuthFormControls } from "../src/components/auth-dialog/auth-form-controls";
import { setupAuthFormValidation } from "../src/components/auth-dialog/auth-form-validation";

const createRegistrationForm = (): HTMLFormElement => {
  const form = document.createElement("form");
  form.innerHTML = `
    <div class="auth-dialog__input">
      <input id="auth-email" name="email" type="email" required>
      <p id="auth-email-error" hidden></p>
    </div>
    <div class="auth-dialog__input">
      <input id="auth-password" name="password" type="password" required>
      <p id="auth-password-error" hidden></p>
      <button class="auth-dialog__visibility" type="button" aria-controls="auth-password" aria-label="Show password"></button>
    </div>
    <div class="auth-dialog__input">
      <input id="auth-confirm-password" name="confirm-password" type="password" required>
      <p id="auth-confirm-password-error" hidden></p>
    </div>
    <button class="auth-dialog__switch" type="button"></button>
    <button class="auth-dialog__submit" type="submit"></button>
  `;
  return form;
};

describe("auth form controls", () => {
  it("switches between login and register modes", () => {
    const form = createRegistrationForm();
    const switchMode = vi.fn();
    setupAuthFormControls(form, "register", switchMode);

    form.querySelector<HTMLButtonElement>(".auth-dialog__switch")?.click();

    expect(switchMode).toHaveBeenCalledWith("login");
  });

  it("toggles password visibility and exposes the new state accessibly", () => {
    const form = createRegistrationForm();
    setupAuthFormControls(form, "login", vi.fn());
    const password = form.querySelector<HTMLInputElement>("#auth-password");
    const visibility = form.querySelector<HTMLButtonElement>(
      ".auth-dialog__visibility",
    );

    visibility?.click();
    expect(password?.type).toBe("text");
    expect(visibility?.getAttribute("aria-pressed")).toBe("true");
    expect(visibility?.getAttribute("aria-label")).toBe("Hide password");

    visibility?.click();
    expect(password?.type).toBe("password");
    expect(visibility?.getAttribute("aria-pressed")).toBe("false");
  });

  it("ignores visibility controls whose target input is missing", () => {
    const form = document.createElement("form");
    form.innerHTML =
      '<button class="auth-dialog__visibility" type="button" aria-controls="missing"></button>';
    setupAuthFormControls(form, "login", vi.fn());

    form.querySelector<HTMLButtonElement>("button")?.click();

    expect(form.querySelector("input")).toBeNull();
  });
});

describe("auth form validation", () => {
  it("updates field errors, password confirmation, and submit validity", () => {
    const form = createRegistrationForm();
    setupAuthFormValidation(form, "register");
    const email = form.querySelector<HTMLInputElement>("#auth-email");
    const password = form.querySelector<HTMLInputElement>("#auth-password");
    const confirmation = form.querySelector<HTMLInputElement>(
      "#auth-confirm-password",
    );
    const submit = form.querySelector<HTMLButtonElement>(
      ".auth-dialog__submit",
    );

    if (!email || !password || !confirmation || !submit)
      throw new Error("The registration form fixture is incomplete.");

    email.value = "invalid";
    email.dispatchEvent(new Event("input", { bubbles: true }));
    expect(form.querySelector("#auth-email-error")?.textContent).toBe(
      "Enter a valid email address.",
    );
    expect(submit.disabled).toBe(true);

    email.value = "lera@example.com";
    password.value = "Secret1!";
    confirmation.value = "Other1!";
    password.dispatchEvent(new Event("input", { bubbles: true }));
    expect(
      form.querySelector("#auth-confirm-password-error")?.textContent,
    ).toBe("Passwords do not match.");

    confirmation.value = "Secret1!";
    confirmation.dispatchEvent(new Event("input", { bubbles: true }));
    expect(
      form.querySelector<HTMLSpanElement>("#auth-confirm-password-error")
        ?.hidden,
    ).toBe(true);
    expect(submit.disabled).toBe(false);
  });

  it("validates all fields on submit and updates invalid accessibility state", () => {
    const form = createRegistrationForm();
    setupAuthFormValidation(form, "register");
    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });

    form.dispatchEvent(submitEvent);

    expect(submitEvent.defaultPrevented).toBe(true);
    expect(
      form
        .querySelector<HTMLInputElement>("#auth-email")
        ?.getAttribute("aria-invalid"),
    ).toBe("true");
    expect(form.querySelector("#auth-email-error")?.textContent).toBe(
      "This field is required.",
    );
  });
});
