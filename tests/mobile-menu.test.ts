import { describe, expect, it, vi } from "vitest";
import { createMobileMenu } from "../src/components/mobile-menu/mobile-menu";
import { setupMobileMenu } from "../src/components/mobile-menu/mobile-menu-controller";

describe("mobile navigation menu", () => {
  it("traps focus, handles Escape, and opens registration from the menu", () => {
    const menu = createMobileMenu("home", vi.fn());
    const toggle = document.createElement("button");
    const openAuth = vi.fn();
    const onLogout = vi.fn();
    document.body.append(toggle, menu);
    setupMobileMenu(toggle, menu, openAuth, onLogout);
    toggle.click();
    const close = menu.querySelector<HTMLButtonElement>(".mobile-menu__close")!;
    expect(menu.inert).toBe(false);
    expect(close).toBe(document.activeElement);

    menu.querySelector<HTMLAnchorElement>(".mobile-menu__logo")!.focus();
    const reverseTab = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      cancelable: true,
    });
    document.dispatchEvent(reverseTab);
    expect(reverseTab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(
      menu.querySelector(".mobile-menu__logout-button"),
    );

    menu
      .querySelector<HTMLButtonElement>(".mobile-menu__signup-button")!
      .click();
    expect(openAuth).toHaveBeenCalledWith("register");
    expect(menu.inert).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    toggle.click();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(menu.inert).toBe(true);
    menu
      .querySelector<HTMLButtonElement>(".mobile-menu__logout-button")!
      .click();
    expect(onLogout).toHaveBeenCalledOnce();
  });
});
