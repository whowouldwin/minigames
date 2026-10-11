import { describe, expect, it, vi } from "vitest";
import { getVisiblePageWindow } from "../src/components/library-pagination/pagination-page-window";
import { createLibraryPagination } from "../src/components/library-pagination/library-pagination";

describe("library pagination", () => {
  it("keeps the visible page window within valid bounds", () => {
    expect(getVisiblePageWindow(1, 10, 4)).toEqual({
      firstPage: 1,
      lastPage: 4,
    });
    expect(getVisiblePageWindow(8, 10, 4)).toEqual({
      firstPage: 6,
      lastPage: 9,
    });
    expect(getVisiblePageWindow(10, 10, 4)).toEqual({
      firstPage: 7,
      lastPage: 10,
    });
  });

  it("clamps updates, disables boundary arrows, and changes pages on click", () => {
    const onPageChange = vi.fn();
    const pagination = createLibraryPagination(onPageChange);
    document.body.append(pagination.element);
    pagination.update(3, 8);

    const previous = pagination.element.querySelector<HTMLButtonElement>(
      '[aria-label="Previous page"]',
    )!;
    const next = pagination.element.querySelector<HTMLButtonElement>(
      '[aria-label="Next page"]',
    )!;
    expect(
      pagination.element.querySelector('[aria-current="page"]')?.textContent,
    ).toBe("3");
    previous.click();
    next.click();
    pagination.element
      .querySelector<HTMLButtonElement>('[aria-label="Page 4"]')!
      .click();
    expect(onPageChange.mock.calls.map(([page]) => page)).toEqual([2, 4, 4]);

    pagination.update(99, 3);
    expect(
      pagination.element.querySelector('[aria-current="page"]')?.textContent,
    ).toBe("3");
    expect(next.disabled).toBe(true);
    expect(
      pagination.element.querySelectorAll('[aria-label^="Page "]'),
    ).toHaveLength(3);
    pagination.destroy();
  });
});
