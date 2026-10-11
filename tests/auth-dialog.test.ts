import { describe, expect, it, vi } from "vitest";
import { createAuthDialog } from "../src/components/auth-dialog/auth-dialog";
import { createDeferred } from "./helpers/deferred";

describe("authentication dialog", () => {
  it("switches tabs accessibly and forwards a Google sign-in action", async () => {
    const onClose = vi.fn();
    const onModeChange = vi.fn();
    const onAuthenticate = vi.fn().mockResolvedValue(undefined);
    const onGoogleAuthenticate = vi.fn().mockResolvedValue(undefined);
    const dialog = createAuthDialog({
      onClose,
      onModeChange,
      onAuthenticate,
      onGoogleAuthenticate,
    });
    document.body.append(dialog.element);
    dialog.open("login");

    expect(dialog.element.querySelector("#auth-email")).not.toBeNull();
    expect(dialog.element.querySelector("#auth-username")).toBeNull();
    dialog.element
      .querySelector<HTMLButtonElement>('[data-mode="register"]')!
      .click();
    expect(onModeChange).toHaveBeenCalledWith("register");
    dialog.open("register");
    expect(dialog.element.querySelector("#auth-username")).not.toBeNull();
    expect(
      dialog.element.querySelector("#auth-confirm-password"),
    ).not.toBeNull();
    expect(
      dialog.element.querySelector(".auth-dialog__google")?.textContent,
    ).toContain("Sign up with Google");

    dialog.element
      .querySelector<HTMLButtonElement>(".auth-dialog__google")!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onGoogleAuthenticate).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps pending authentication from closing and restores focus after close", async () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const { promise, resolve: finish } = createDeferred<void>();
    const onAuthenticate = vi.fn(() => promise);
    const onClose = vi.fn();
    const dialog = createAuthDialog({
      onClose,
      onModeChange: vi.fn(),
      onAuthenticate,
      onGoogleAuthenticate: vi.fn().mockResolvedValue(undefined),
    });
    document.body.append(dialog.element);
    dialog.open("login");
    const email =
      dialog.element.querySelector<HTMLInputElement>("#auth-email")!;
    const password =
      dialog.element.querySelector<HTMLInputElement>("#auth-password")!;
    email.value = "lera@example.com";
    password.value = "secret123";
    email.dispatchEvent(new Event("input", { bubbles: true }));
    password.dispatchEvent(new Event("input", { bubbles: true }));
    const form = dialog.element.querySelector("form")!;
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    await Promise.resolve();

    dialog.element
      .querySelector<HTMLButtonElement>(".auth-dialog__close")!
      .click();
    await dialog.close();
    expect(onClose).not.toHaveBeenCalled();
    finish();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onAuthenticate).toHaveBeenCalledWith("login", {
      email: "lera@example.com",
      password: "secret123",
    });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
