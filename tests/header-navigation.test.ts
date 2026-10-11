import { describe, expect, it, vi } from "vitest";
import { createHeader } from "../src/components/header/header";
import {
  createNavigationList,
  updateNavigationState,
} from "../src/components/navigation/create-navigation-list";
import type { AppSession } from "../src/auth/app-session";

const session: AppSession = {
  displayName: "Lera Example",
  email: "lera@example.com",
  authenticatedAt: 123,
};

describe("header and navigation behavior", () => {
  it("switches between guest and authenticated actions on desktop and mobile", () => {
    const openAuth = vi.fn();
    const navigateTo = vi.fn();
    const onLogout = vi.fn();
    const header = createHeader(openAuth, "home", navigateTo, onLogout);
    const desktop = header.element.querySelector(".header__buttons")!;

    desktop.querySelector<HTMLButtonElement>(".header__login-button")!.click();
    desktop.querySelector<HTMLButtonElement>(".header__signup-button")!.click();
    expect(openAuth.mock.calls).toEqual([["login"], ["register"]]);
    expect(header.element.querySelector(".header__logout-button")).toBeNull();

    header.setAuthenticated(session);
    expect(desktop.textContent).toContain("Lera Example");
    expect(
      desktop.querySelector(".profile-identity__fallback")?.textContent,
    ).toBe("LE");
    header.element
      .querySelector<HTMLButtonElement>(".header__logout-button")!
      .click();
    expect(onLogout).toHaveBeenCalledOnce();

    header.element.querySelector<HTMLButtonElement>(".menu-toggle")!.click();
    expect(
      header.element
        .querySelector("#mobile-menu")
        ?.classList.contains("mobile-menu--open"),
    ).toBe(true);
    header.element
      .querySelector<HTMLButtonElement>(".mobile-menu__logout-button")!
      .click();
    expect(onLogout).toHaveBeenCalledTimes(2);
    header.setGuest();
    expect(desktop.querySelector(".header__login-button")).not.toBeNull();
    expect(
      header.element.querySelector(".mobile-menu__logout-button"),
    ).toBeNull();
  });

  it("routes unmodified navigation clicks and updates the active page state", () => {
    const navigate = vi.fn();
    const list = createNavigationList("header", "home", navigate);
    const library = list.querySelector<HTMLAnchorElement>(
      '[data-page="library"]',
    )!;
    const click = new MouseEvent("click", {
      button: 0,
      cancelable: true,
      bubbles: true,
    });
    library.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledWith("library");

    const modified = new MouseEvent("click", {
      button: 0,
      ctrlKey: true,
      cancelable: true,
      bubbles: true,
    });
    library.dispatchEvent(modified);
    expect(modified.defaultPrevented).toBe(false);
    expect(navigate).toHaveBeenCalledOnce();
    updateNavigationState(list, "library");
    expect(library.getAttribute("aria-current")).toBe("page");
    expect(library.classList.contains("header__link--active")).toBe(true);
  });
});
