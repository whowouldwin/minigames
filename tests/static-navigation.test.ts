import { describe, expect, it, vi } from "vitest";
import { createHero } from "../src/components/hero/hero";
import { createFooter } from "../src/components/footer/footer";

describe("home and footer navigation", () => {
  it("routes the hero call to action to the library", () => {
    const navigate = vi.fn();
    const hero = createHero(navigate);
    expect(hero.querySelector("h1")?.textContent).toContain(
      "Take a Short Break",
    );
    hero.querySelector<HTMLButtonElement>(".hero__button")!.click();
    expect(navigate).toHaveBeenCalledWith("library");
  });

  it("routes footer links through the app while keeping external links intact", () => {
    const navigate = vi.fn();
    const footer = createFooter(navigate);
    const library = footer.querySelector<HTMLAnchorElement>(
      '[data-target-page="library"]',
    )!;
    const click = new MouseEvent("click", {
      button: 0,
      cancelable: true,
      bubbles: true,
    });
    library.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledWith("library");
    expect(
      footer.querySelector<HTMLAnchorElement>(
        '.footer__credit[href^="https://"]',
      )?.href,
    ).toContain("rs.school");
  });
});
