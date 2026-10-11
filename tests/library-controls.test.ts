import { beforeEach, describe, expect, it, vi } from "vitest";

const { getLibraryCategories } = vi.hoisted(() => ({
  getLibraryCategories: vi.fn(),
}));

vi.mock("../src/api", () => ({
  DEFAULT_LIBRARY_GAMES_QUERY: {
    category: "all",
    sort: "rating-desc",
    page: 1,
  },
  getErrorMessage: (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback,
  getLibraryCategories,
}));

import { createFilterChips } from "../src/components/library-controls/create-filter-chips";
import { createSortControl } from "../src/components/library-controls/create-sort-control";
import { createLibraryControls } from "../src/components/library-controls/library-controls";
import type { SnackbarController } from "../src/components/ui/snackbar";

const categories = [
  { slug: "all", label: "All", isDefault: true },
  { slug: "puzzle", label: "Puzzle", isDefault: false },
] as const;

const snackbar = { show: vi.fn() } as unknown as SnackbarController;

describe("library filter and sort controls", () => {
  beforeEach(() => {
    getLibraryCategories.mockReset();
    snackbar.show = vi.fn();
  });

  it("changes a category only when a different filter is selected", () => {
    const onChange = vi.fn();
    const filters = createFilterChips([...categories], "all", onChange);

    filters.elements[0].click();
    filters.elements[1].click();
    filters.setSelected("puzzle");

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("puzzle");
    expect(filters.elements[1].getAttribute("aria-pressed")).toBe("true");
    expect(filters.elements[0].getAttribute("aria-pressed")).toBe("false");
  });

  it("supports keyboard navigation and selection in the sort listbox", () => {
    const onChange = vi.fn();
    const sort = createSortControl(onChange);
    document.body.append(sort.element);
    const trigger = sort.element.querySelector<HTMLButtonElement>(
      "[aria-haspopup=listbox]",
    )!;

    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    const options = [
      ...sort.element.querySelectorAll<HTMLButtonElement>("[role=option]"),
    ];
    expect(
      sort.element.querySelector<HTMLDivElement>("[role=listbox]")?.hidden,
    ).toBe(false);
    expect(document.activeElement).toBe(options[0]);

    options[0].dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    expect(document.activeElement).toBe(options[1]);
    options[1].click();

    expect(onChange).toHaveBeenCalledWith("rating-asc");
    expect(
      sort.element.querySelector<HTMLDivElement>("[role=listbox]")?.hidden,
    ).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
    sort.destroy();
  });

  it("loads categories, applies query updates, and retries a failed request", async () => {
    getLibraryCategories
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: [...categories] });
    const onFilterChange = vi.fn();
    const onSortChange = vi.fn();
    const controls = createLibraryControls(
      { onFilterChange, onSortChange },
      snackbar,
    );
    document.body.append(controls.element);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      controls.element.querySelector('[role="alert"]')?.textContent,
    ).toContain("offline");
    expect(snackbar.show).toHaveBeenCalledWith(
      "The game categories could not be loaded.",
      "error",
    );
    controls.element
      .querySelector<HTMLButtonElement>(".request-feedback__retry")!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    controls.update({ category: "puzzle", sort: "name-asc", page: 2 });
    const puzzle = controls.element.querySelector<HTMLButtonElement>(
      '[data-category="puzzle"]',
    )!;
    expect(puzzle.getAttribute("aria-pressed")).toBe("true");
    expect(
      controls.element.querySelector(".library-controls__sort-label")
        ?.textContent,
    ).toBe("Sort by: Name A→Z");
    controls.element
      .querySelector<HTMLButtonElement>('[data-category="all"]')!
      .click();
    expect(onFilterChange).toHaveBeenCalledWith("all");
    expect(onSortChange).not.toHaveBeenCalled();
    controls.destroy();
  });
});
